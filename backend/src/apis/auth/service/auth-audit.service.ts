import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { TAuthEventKind, TRiskFlag } from '@nook/shared';
import type { IClientDevice } from '../../../core/interface/index.js';
import { GeoService } from '../../../infra/geo/index.js';
import { AuthEventRepository, UserDeviceRepository } from '../../../repository/index.js';
import { QUEUE, type ILoginAlertJob } from '../../../queue/constant/index.js';

/** Đổi nước trong vòng ngần này là "bay không kịp". */
const IMPOSSIBLE_TRAVEL_MS = 6 * 3_600_000;
/** Cửa sổ và ngưỡng của `many_failures`. */
const FAILURE_WINDOW_MS = 3_600_000;
const MANY_FAILURES = 5;

type TSuccessKind = Exclude<TAuthEventKind, 'login_failed'>;

export interface IRiskInput {
  deviceId: string | null;
  /** Máy này đã có dòng trong `user_devices` của người này chưa. */
  deviceKnown: boolean;
  country: string | null;
  /** Các nước đã thấy trước lần này (máy + sổ). */
  knownCountries: readonly string[];
  /** Lần vào được gần nhất trước lần này. */
  last: { country: string | null; at: Date } | null;
  /** Số lần sai mật khẩu trong giờ qua, TÍNH CẢ lần này nếu lần này là lần sai. */
  failures: number;
  now: Date;
}

/** Luật chấm dấu hiệu — hàm thuần, kiểm riêng được. */
export function assessRisk(r: IRiskInput): TRiskFlag[] {
  const flags: TRiskFlag[] = [];
  if (!r.deviceId || !r.deviceKnown) flags.push('new_device');
  // Chưa từng biết nước nào thì không gọi là "nước mới" — không thì bật tra IP
  // lên là MỌI tài khoản cũ nhận một lá thư.
  if (r.country && r.knownCountries.length > 0 && !r.knownCountries.includes(r.country)) {
    flags.push('new_country');
  }
  if (
    r.country &&
    r.last?.country &&
    r.last.country !== r.country &&
    r.now.getTime() - r.last.at.getTime() < IMPOSSIBLE_TRAVEL_MS
  ) {
    flags.push('impossible_travel');
  }
  if (r.failures >= MANY_FAILURES) flags.push('many_failures');
  return flags;
}

/**
 * Sổ đăng nhập: ghi mỗi lần vào được / gõ sai, nhớ máy, chấm dấu hiệu bất
 * thường, và báo thư khi có máy lạ / nước lạ.
 *
 * KHÔNG BAO GIỜ làm hỏng việc đăng nhập: mọi lỗi ở đây chỉ thành một dòng WARN.
 * Chưa chặn ai — xác minh thêm khi rủi ro cao là bước sau (README mục 1).
 *
 * Lần gõ SAI không ghi máy vào `user_devices`: không thì kẻ dò mật khẩu đi
 * qua là máy của nó thành "máy quen", và lần nó đoán trúng không còn
 * `new_device` nữa.
 */
@Injectable()
export class AuthAuditService {
  private readonly log = new Logger('AuthAudit');

  constructor(
    private readonly devices: UserDeviceRepository,
    private readonly events: AuthEventRepository,
    private readonly geo: GeoService,
    @InjectQueue(QUEUE.mail) private readonly mail: Queue<ILoginAlertJob>,
  ) {}

  /**
   * Một lần vào được. `trust`: lần này người dùng đã nhập đúng MÃ gửi tới hộp
   * thư/số — máy thành máy tin cậy. Chỉ mật khẩu thì không.
   */
  async success(
    userId: string,
    kind: TSuccessKind,
    client: IClientDevice,
    trust: boolean,
  ): Promise<void> {
    try {
      await this.recordSuccess(userId, kind, client, trust);
    } catch (e) {
      this.log.warn(`audit write failed (${kind}) user=${userId}: ${describe(e)}`);
    }
  }

  /** Gõ sai mật khẩu vào một tài khoản CÓ THẬT. */
  async failure(userId: string, client: IClientDevice): Promise<void> {
    try {
      const now = new Date();
      const country = this.geo.countryOf(client.ip, client.edgeCountry);
      const [deviceKnown, countries, last, failures] = await Promise.all([
        client.deviceId ? this.devices.exists({ userId, deviceId: client.deviceId }) : false,
        this.knownCountries(userId),
        this.events.lastSuccessOf(userId),
        this.events.failuresSince(userId, new Date(now.getTime() - FAILURE_WINDOW_MS)),
      ]);
      const risk = assessRisk({
        deviceId: client.deviceId,
        deviceKnown,
        country,
        knownCountries: countries,
        last: last ? { country: last.country, at: last.createdAt } : null,
        failures: failures + 1,
        now,
      });
      await this.write(userId, 'login_failed', client, country, risk);
    } catch (e) {
      this.log.warn(`audit write failed (login_failed) user=${userId}: ${describe(e)}`);
    }
  }

  private async recordSuccess(
    userId: string,
    kind: TSuccessKind,
    client: IClientDevice,
    trust: boolean,
  ): Promise<void> {
    const now = new Date();
    const country = this.geo.countryOf(client.ip, client.edgeCountry);

    const [deviceCount, deviceKnown, countries, last, failures] = await Promise.all([
      this.devices.count({ userId }),
      client.deviceId ? this.devices.exists({ userId, deviceId: client.deviceId }) : false,
      this.knownCountries(userId),
      this.events.lastSuccessOf(userId),
      this.events.failuresSince(userId, new Date(now.getTime() - FAILURE_WINDOW_MS)),
    ]);

    const risk = assessRisk({
      deviceId: client.deviceId,
      deviceKnown,
      country,
      knownCountries: countries,
      last: last ? { country: last.country, at: last.createdAt } : null,
      failures,
      now,
    })
      // Tài khoản vừa mở thì máy nào cũng "mới" — ghi vào sổ chỉ là nhiễu.
      .filter((f) => kind !== 'signup' || f !== 'new_device');

    const event = await this.write(userId, kind, client, country, risk);

    if (client.deviceId) {
      await this.devices.sighted({
        userId,
        deviceId: client.deviceId,
        model: client.model,
        os: client.os,
        appVersion: client.appVersion,
        ip: client.ip,
        country,
        trust,
      });
    }

    if (kind === 'signup') return;
    // Tài khoản chưa từng có máy nào (mở từ trước khi app gửi mã máy) thì máy
    // nào cũng "mới" — kêu lúc đó chỉ là nhiễu, và không gửi thư.
    const hadDevices = deviceCount > 0;
    const notable = hadDevices ? risk : risk.filter((f) => f !== 'new_device');
    if (notable.length === 0) return;

    this.log.warn(
      `risky login user=${userId} kind=${kind} flags=${notable.join(',')} country=${last?.country ?? '-'}->${country ?? '-'}`,
    );

    if (hadDevices && (risk.includes('new_device') || risk.includes('new_country'))) {
      // Không chờ: đăng nhập không được chậm vì một lá thư. Hàng đợi lo thử lại.
      this.mail
        .add(QUEUE.job.loginAlert, { eventId: event.id })
        .catch((e: unknown) =>
          this.log.warn(`login alert not queued user=${userId}: ${describe(e)}`),
        );
    }
  }

  private async knownCountries(userId: string): Promise<string[]> {
    const [a, b] = await Promise.all([
      this.devices.countriesOf(userId),
      this.events.successCountriesOf(userId),
    ]);
    return [...new Set([...a, ...b])];
  }

  private write(
    userId: string,
    kind: TAuthEventKind,
    client: IClientDevice,
    country: string | null,
    risk: TRiskFlag[],
  ) {
    return this.events.create({
      userId,
      kind,
      deviceId: client.deviceId,
      model: client.model,
      os: client.os,
      ip: client.ip,
      country,
      risk,
    });
  }
}

function describe(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
