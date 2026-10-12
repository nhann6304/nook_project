import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';
import { ERR, LIMITS, type TSignInMethod } from '@nook/shared';
import { AppException } from '../../../core/error/index.js';
import { Env } from '../../../config/env/index.js';
import { RedisService } from '../../../infra/redis/service/index.js';
import { maskTarget } from '../../../infra/notify/sender/index.js';
import type { IIssuedCode } from '../auth.interface.js';

/**
 * Sổ khoá Redis của phần mã đăng nhập. Để ngoài lớp cho dễ đối chiếu khi phải
 * cầm `redis-cli` soi lúc nửa đêm.
 *
 *   auth:code:<kind>:<target>     băm { hash, box, tries, sentAt }  TTL 300s
 *   auth:resend:<kind>:<target>   chốt chặn gửi lại              TTL  60s
 *   auth:hour:<kind>:<target>     con đếm số mã trong một giờ    TTL 3600s
 *   auth:hour:ip:<ip>             con đếm số mã theo máy gọi     TTL 3600s
 *   auth:verify:ip:<ip>           con đếm số lần NỘP mã          TTL 3600s
 */
const KEY = {
  code: (method: TSignInMethod, target: string) => `auth:code:${method}:${target}`,
  resend: (method: TSignInMethod, target: string) => `auth:resend:${method}:${target}`,
  callerHour: (ip: string) => `auth:hour:ip:${ip}`,
  verifyHour: (ip: string) => `auth:verify:ip:${ip}`,
  hour: (method: TSignInMethod, target: string) => `auth:hour:${method}:${target}`,
} as const;

const HOUR_SECONDS = 3_600;

/**
 * Xin lại mà mã cũ còn sống ÍT NHẤT ngần này giây thì gửi lại đúng mã cũ; ít
 * hơn thì cấp mã mới — đừng đưa người ta một mã sắp chết trên đường tới hộp thư.
 */
const REUSE_MIN_TTL_SECONDS = 60;

/** Nhãn HKDF: khoá hộp mã khác hẳn khoá HMAC dù cùng sinh từ `AUTH_CODE_SECRET`. */
const BOX_KEY_INFO = 'nook/auth-code-box/v1';
const BOX_IV_BYTES = 12;
const BOX_TAG_BYTES = 16;

/**
 * Mã 6 số: sinh, cất, đối chiếu.
 *
 * **Mã sống trong Redis, không sống trong Postgres.** Ba lý do, theo thứ tự
 * quan trọng:
 *
 * 1. Nó tự chết. `EXPIRE 300` là hết hạn thật, không cần ai đi dọn.
 * 2. Postgres không quên. Ghi vào đó là mã còn nằm trong WAL và trong mọi bản
 *    sao lưu — "đã xoá" ở Postgres không có nghĩa là đã biến mất.
 * 3. Đếm số lần gõ sai là việc ghi liên tục vào một dòng. Postgres làm được,
 *    nhưng đó là bắt xe tải chở một lá thư.
 *
 * Cất là **dấu vân** của mã, không phải mã. Ai đọc được Redis cũng không đăng
 * nhập thay ai được.
 *
 * ── Dấu vân là HMAC, KHÔNG phải argon2 — và đó là chủ ý ────────────────────
 *
 * Argon2 sinh ra để chống bẻ khoá NGOẠI TUYẾN cho mật khẩu: thứ sống nhiều
 * năm, người ta dùng lại ở chỗ khác, nên phải làm mỗi lần thử tốn kém. Mã ở
 * đây sống 300 giây, sai 5 lần là chết. Ai bẻ được nó ba tiếng sau thì cầm
 * trong tay một cái mã đã hết hạn từ lâu.
 *
 * Cái giá thì có thật: argon2 mặc định ngốn 64 MB và chạy trên hàng đợi luồng
 * phụ của libuv — mặc định BỐN luồng, dùng chung với đọc tệp và tra DNS của cả
 * server. Băm một cái cho MỖI lần xin mã nghĩa là ai bắn liên tục vào
 * `/auth/code` thì làm nghẽn hàng đợi đó, và mọi thứ khác đứng theo.
 *
 * HMAC-SHA256 với khoá riêng của server thì tức thời, và người đọc được Redis
 * vẫn không suy ngược ra mã vì họ không có khoá — đúng mức an toàn cần cho bài
 * toán này. Dấu vân buộc luôn vào `method:target` để một dấu vân không dùng
 * lại được cho đích khác.
 *
 * ── Xin lại trong 5 phút thì gửi lại ĐÚNG mã cũ (12/10/2026) ───────────────
 *
 * Như Facebook: bấm "gửi lại" không đẻ mã mới, nên thư đến trễ vẫn dùng được.
 * Vì thế cạnh dấu vân có thêm `box` — mã mã hoá AES-256-GCM (khoá HKDF từ
 * `AUTH_CODE_SECRET`, buộc vào `method:target`). Gửi lại KHÔNG đặt lại `tries`
 * và KHÔNG gia hạn: mã không bao giờ sống quá 5 phút kể từ lúc sinh. Chốt 60
 * giây và trần theo giờ đứng nguyên — gửi lại vẫn là một lá thư.
 */
@Injectable()
export class CodeService {
  /** Giới hạn lấy từ @nook/shared — app và server đọc CÙNG một con số. */
  readonly limits = {
    length: LIMITS.codeLength,
    ttlSeconds: LIMITS.codeTtlSeconds,
    maxTries: LIMITS.codeMaxTries,
    resendSeconds: LIMITS.codeResendSeconds,
    perHour: LIMITS.codesPerHour,
    perHourPerIp: LIMITS.codesPerHourPerIp,
    verifyPerHourPerIp: LIMITS.verifyPerHourPerIp,
  } as const;

  private readonly secret: string;
  private readonly boxKey: Buffer;
  private readonly log = new Logger('AuthCode');

  constructor(
    private readonly redis: RedisService,
    config: ConfigService<Env, true>,
  ) {
    this.secret = config.get('AUTH_CODE_SECRET', { infer: true });
    this.boxKey = Buffer.from(hkdfSync('sha256', this.secret, '', BOX_KEY_INFO, 32));
  }

  /**
   * Trần theo MÁY GỌI, không theo email.
   *
   * Phải gọi TRƯỚC mọi việc có thể lộ ra "email này đã có tài khoản chưa".
   * Mấy trần kia khoá theo email nên kẻ gõ mỗi lần một email khác đi qua thoải
   * mái — mà đó đúng là hình dạng của việc quét danh sách. Cái này mới cản.
   *
   * Không biết IP (gọi từ trong máy, hoặc chạy thử) thì bỏ qua: thà không chặn
   * còn hơn dồn cả thiên hạ vào chung một cái xô rồi khoá nhầm người thật.
   */
  async guardCaller(ip: string | null): Promise<void> {
    if (!ip) return;

    const key = KEY.callerHour(ip);
    const used = await this.redis.client.incr(key);
    if (used === 1) await this.redis.client.expire(key, HOUR_SECONDS);

    if (used > this.limits.perHourPerIp) {
      throw new AppException(ERR.CODE_TOO_MANY_HERE, HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: Math.max(await this.redis.ttl(key), 1),
      });
    }
  }

  /**
   * Trần theo máy gọi cho cửa NỘP mã.
   *
   * Không phải để chống đoán mã — 5 lần sai là mã chết. Cái này bịt chỗ khác:
   * `/auth/verify` từng là cửa duy nhất không có trần nào, nên nó là chỗ bắn
   * thoải mái. Con số rộng hơn trần xin mã vì người thật gõ sai mã là bình
   * thường, còn xin mã 30 lần một giờ thì không.
   */
  async guardVerifyCaller(ip: string | null): Promise<void> {
    if (!ip) return;

    const key = KEY.verifyHour(ip);
    const used = await this.redis.client.incr(key);
    if (used === 1) await this.redis.client.expire(key, HOUR_SECONDS);

    if (used > this.limits.verifyPerHourPerIp) {
      throw new AppException(ERR.VERIFY_TOO_MANY_HERE, HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: Math.max(await this.redis.ttl(key), 1),
      });
    }
  }

  /**
   * Cấp mã để gửi đi: mã cũ còn sống đủ lâu thì trả lại đúng nó, không thì
   * sinh mới. Đây là chỗ duy nhất trong cả server nhìn thấy mã ở dạng thô.
   */
  async issue(method: TSignInMethod, target: string): Promise<IIssuedCode> {
    const resendKey = KEY.resend(method, target);

    // Chốt gửi lại. `SET … NX EX` là MỘT lệnh: kiểm và đặt không tách rời nhau,
    // nên hai lần bấm cùng lúc chỉ một lần lọt qua. Kiểm trước rồi đặt sau thì
    // giữa hai bước có khe, và người ta bấm nhanh hơn ta tưởng.
    const locked = await this.redis.client.set(resendKey, '1', 'EX', this.limits.resendSeconds, 'NX');
    if (locked === null) {
      throw new AppException(ERR.CODE_TOO_SOON, HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: Math.max(await this.redis.ttl(resendKey), 1),
      });
    }

    // Trần theo giờ. Chốt trên chỉ chặn bấm dồn; chốt này chặn kiên trì cả buổi.
    const hourKey = KEY.hour(method, target);
    const sent = await this.redis.client.incr(hourKey);
    if (sent === 1) await this.redis.client.expire(hourKey, HOUR_SECONDS);
    if (sent > this.limits.perHour) {
      // Trả lại chốt gửi lại: người ta phải chờ hết GIỜ, và con số đếm ngược
      // hiện trên màn phải là con số thật, không phải 60 giây gây hiểu nhầm.
      await this.redis.del(resendKey);
      throw new AppException(ERR.CODE_TOO_MANY, HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: Math.max(await this.redis.ttl(hourKey), 1),
      });
    }

    const codeKey = KEY.code(method, target);
    const live = await this.reusable(method, target, codeKey);
    if (live) {
      this.log.log(`code reused for ${maskTarget(method, target)} (ttl ${live.ttlSeconds}s)`);
      return { ...live, reused: true };
    }

    // `randomInt` của node:crypto, KHÔNG phải `Math.random`. Math.random đoán
    // được: biết vài giá trị trước là suy ra giá trị sau.
    const code = String(randomInt(0, 10 ** this.limits.length)).padStart(this.limits.length, '0');

    await this.redis.client.hset(codeKey, {
      hash: this.sign(method, target, code),
      box: this.seal(method, target, code),
      tries: 0,
      sentAt: Date.now(),
    });
    await this.redis.client.expire(codeKey, this.limits.ttlSeconds);

    this.log.log(`code issued for ${maskTarget(method, target)} (ttl ${this.limits.ttlSeconds}s)`);
    return { code, ttlSeconds: this.limits.ttlSeconds, reused: false };
  }

  /**
   * Mã đang treo, nếu còn sống ≥ `REUSE_MIN_TTL_SECONDS` và mở hộp được. Hộp
   * hỏng, khoá đổi, hay mã treo từ bản cũ chưa có `box` → `null`, cấp mã mới.
   */
  private async reusable(
    method: TSignInMethod,
    target: string,
    codeKey: string,
  ): Promise<{ code: string; ttlSeconds: number } | null> {
    const [row, ttl] = await Promise.all([
      this.redis.client.hgetall(codeKey),
      this.redis.ttl(codeKey),
    ]);
    if (!row.hash || !row.box || ttl < REUSE_MIN_TTL_SECONDS) return null;

    const code = this.open(method, target, row.box);
    if (!code || !this.matches(row.hash, this.sign(method, target, code))) return null;
    return { code, ttlSeconds: ttl };
  }

  /** Đối chiếu mã người dùng gõ. Đúng thì huỷ mã luôn — mỗi mã dùng một lần. */
  async consume(method: TSignInMethod, target: string, code: string): Promise<void> {
    const codeKey = KEY.code(method, target);
    const row = await this.redis.client.hgetall(codeKey);

    // Không có gì trong kho nghĩa là mã đã hết hạn (hoặc chưa từng xin).
    // ĐỪNG gộp với "sai": hai chuyện đó khác nhau, và app hiện hai câu khác nhau.
    if (!row.hash) throw new AppException(ERR.CODE_EXPIRED, HttpStatus.GONE);

    if (Number(row.tries ?? 0) >= this.limits.maxTries) {
      await this.redis.del(codeKey);
      throw new AppException(ERR.CODE_LOCKED, HttpStatus.TOO_MANY_REQUESTS);
    }

    if (!this.matches(row.hash, this.sign(method, target, code))) {
      const tried = await this.redis.client.hincrby(codeKey, 'tries', 1);
      const triesLeft = Math.max(this.limits.maxTries - tried, 0);
      if (triesLeft === 0) await this.redis.del(codeKey);
      throw new AppException(ERR.CODE_INVALID, HttpStatus.BAD_REQUEST, { triesLeft });
    }

    // Đúng rồi thì mã chết ngay. Mở luôn chốt gửi lại — người vừa đăng nhập
    // xong mà đăng xuất rồi vào lại thì không có lý do gì phải chờ 60 giây.
    await this.redis.del(codeKey, KEY.resend(method, target));
  }

  /**
   * Huỷ mã đang treo và mở chốt gửi lại.
   *
   * Dùng khi GỬI HỎNG: người dùng không được ngồi chờ 60 giây cho một mã không
   * bao giờ tới nơi. `keepCode`: lần gửi hỏng là lần gửi LẠI mã cũ — lá thư đầu
   * có thể đã tới, đừng giết mã trong đó, chỉ mở chốt.
   */
  async drop(method: TSignInMethod, target: string, keepCode = false): Promise<void> {
    const keys = [KEY.resend(method, target)];
    if (!keepCode) keys.push(KEY.code(method, target));
    await this.redis.del(...keys);
  }

  /** Còn bao nhiêu giây nữa mới xin được mã lần sau. 0 nghĩa là xin được ngay. */
  async retryAfterSeconds(method: TSignInMethod, target: string): Promise<number> {
    const ttl = await this.redis.ttl(KEY.resend(method, target));
    return ttl > 0 ? ttl : 0;
  }

  /** Dấu vân của mã. Buộc vào đích luôn — một dấu vân không xài cho đích khác. */
  private sign(method: TSignInMethod, target: string, code: string): string {
    return createHmac('sha256', this.secret).update(`${method}:${target}:${code}`).digest('hex');
  }

  /** Hộp mã: `iv.tag.ciphertext` base64url, AAD = `method:target`. */
  private seal(method: TSignInMethod, target: string, code: string): string {
    const iv = randomBytes(BOX_IV_BYTES);
    const cipher = createCipheriv('aes-256-gcm', this.boxKey, iv);
    cipher.setAAD(Buffer.from(`${method}:${target}`));
    const body = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), body].map((b) => b.toString('base64url')).join('.');
  }

  private open(method: TSignInMethod, target: string, box: string): string | null {
    try {
      const [iv, tag, body] = box.split('.').map((p) => Buffer.from(p, 'base64url'));
      if (!iv || !tag || !body || iv.length !== BOX_IV_BYTES || tag.length !== BOX_TAG_BYTES) {
        return null;
      }
      const decipher = createDecipheriv('aes-256-gcm', this.boxKey, iv);
      decipher.setAAD(Buffer.from(`${method}:${target}`));
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
    } catch {
      return null;
    }
  }

  /**
   * So hai chuỗi trong thời gian KHÔNG phụ thuộc vào chỗ chúng khác nhau.
   *
   * `===` thoát ngay ở byte đầu tiên lệch, và khoảng thời gian chênh đó đo
   * được. Ở đây thì khai thác nó gần như không tưởng (mã chết sau 5 lần sai),
   * nhưng so bằng cách đúng cũng chỉ tốn ba dòng.
   *
   * So độ dài trước là bắt buộc: `timingSafeEqual` NÉM khi hai bên khác độ dài
   * — và nó sẽ khác, với những mã còn treo trong Redis từ thời còn dùng argon2.
   */
  private matches(stored: string, expected: string): boolean {
    const a = Buffer.from(stored, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
