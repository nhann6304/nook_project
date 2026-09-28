import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resolver } from 'node:dns/promises';
import { ERR } from '@nook/shared';
import { AppException } from '../../../core/error/index.js';
import { Env } from '../../../config/env/index.js';
import { RedisService } from '../../../infra/redis/service/index.js';
import { DISPOSABLE_EMAIL_DOMAINS } from '../disposable-email.constant.js';

/** Nhớ kết quả tra tên miền, để không hỏi DNS lại mỗi lần có người đăng nhập. */
const KEY = {
  mx: (domain: string) => `auth:mx:${domain}`,
} as const;

/** Có chỗ nhận thư thì nhớ lâu; không có thì nhớ ngắn, phòng khi họ vừa dựng. */
const MX_TTL_SECONDS = { yes: 86_400, no: 3_600 } as const;

/** Hai mã này nghĩa là "tên miền không có chỗ nhận thư", chắc chắn. */
const DNS_NO_ANSWER = new Set(['ENOTFOUND', 'ENODATA', 'NXDOMAIN', 'NODATA']);

/**
 * Email đúng dạng rồi, nhưng có NHẬN được không.
 *
 * Hai câu hỏi, hai mức chắc chắn khác nhau:
 *
 * 1. Hộp thư dùng một lần — danh sách cứng, chắc chắn, chặn ngay.
 * 2. Tên miền có chỗ nhận thư không — hỏi DNS, và chỗ này phải cẩn thận.
 *
 * ── Hỏng thì MỞ, không đóng ────────────────────────────────────────────────
 *
 * DNS hết giờ, mạng chập, máy chủ tên lăn ra — chỉ có nghĩa là ta KHÔNG BIẾT,
 * không có nghĩa là email sai. Đóng cửa lúc không biết là một cú DNS chập làm
 * cả app không ai đăng ký được, và không ai hiểu vì sao. Chỉ chặn khi DNS trả
 * lời dứt khoát "tên miền này không có chỗ nhận thư".
 */
@Injectable()
export class EmailGuardService {
  private readonly log = new Logger('EmailGuard');

  /**
   * Bộ tra riêng, có hạn giờ. Bộ mặc định của Node không có hạn giờ nào cả —
   * một máy chủ tên câm là request treo cho tới lúc client bỏ cuộc.
   */
  private readonly resolver = new Resolver({ timeout: 3_000, tries: 2 });

  private readonly mxCheck: boolean;

  constructor(
    private readonly redis: RedisService,
    config: ConfigService<Env, true>,
  ) {
    this.mxCheck = config.get('EMAIL_MX_CHECK', { infer: true });
  }

  /** Ném `TARGET_NOT_ALLOWED` nếu email này không nhận được. Email đã chuẩn hoá. */
  async assertUsable(email: string): Promise<void> {
    const domain = email.slice(email.lastIndexOf('@') + 1);
    if (!domain) throw new AppException(ERR.TARGET_INVALID, HttpStatus.BAD_REQUEST);

    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      throw new AppException(ERR.TARGET_NOT_ALLOWED, HttpStatus.BAD_REQUEST);
    }

    if (!this.mxCheck) return;
    if (!(await this.acceptsMail(domain))) {
      throw new AppException(ERR.TARGET_NOT_ALLOWED, HttpStatus.BAD_REQUEST);
    }
  }

  private async acceptsMail(domain: string): Promise<boolean> {
    const key = KEY.mx(domain);

    const cached = await this.redis.client.get(key);
    if (cached !== null) return cached === '1';

    const answer = await this.lookup(domain);
    // Không biết thì đừng nhớ — lần sau hỏi lại, may ra DNS đã tỉnh.
    if (answer === null) return true;

    const ttl = answer ? MX_TTL_SECONDS.yes : MX_TTL_SECONDS.no;
    await this.redis.client.set(key, answer ? '1' : '0', 'EX', ttl);
    return answer;
  }

  /** `true` nhận thư · `false` chắc chắn không · `null` không biết. */
  private async lookup(domain: string): Promise<boolean | null> {
    try {
      const mx = await this.resolver.resolveMx(domain);
      if (mx.length > 0) return true;
    } catch (error) {
      if (!DNS_NO_ANSWER.has((error as { code?: string }).code ?? '')) {
        this.log.warn(`mx lookup failed for ${domain}: ${(error as Error).message}`);
        return null;
      }
    }

    // Không có MX thì vẫn chưa kết luận được: RFC 5321 mục 5.1 cho phép giao
    // thư thẳng vào bản ghi A. Hiếm, nhưng có thật — mấy tên miền nhỏ tự dựng.
    // Chặn nhầm một tên miền thật thì người dùng không hiểu vì sao mình bị đuổi.
    try {
      return (await this.resolver.resolve4(domain)).length > 0;
    } catch (error) {
      if (DNS_NO_ANSWER.has((error as { code?: string }).code ?? '')) return false;
      this.log.warn(`a lookup failed for ${domain}: ${(error as Error).message}`);
      return null;
    }
  }
}
