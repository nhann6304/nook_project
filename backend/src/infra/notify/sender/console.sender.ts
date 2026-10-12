import { Injectable, Logger } from '@nestjs/common';
import { LIMITS, type TSignInMethod } from '@nook/shared';
import type { ICodeSendMeta, ICodeSender } from './code-sender.interface.js';
import type { ILoginAlert } from './login-alert-mail.js';
import { toAsciiLog } from './sms.util.js';

/**
 * In mã ra log — cho cả email lẫn số điện thoại. **Chỉ dùng khi dev.**
 *
 * `validateEnv` không cho `SMS_SENDER=console` đi kèm bản thật. `CODE_SENDER`
 * thì còn cho (cụm Docker staging dùng nó), nên lớp này tự kêu bằng WARN.
 *
 * Bài smoke đọc mã bằng `code: [0-9]{6}` — đổi hình dạng dòng này là đỏ cả bộ.
 */
@Injectable()
export class ConsoleSender implements ICodeSender {
  readonly kind = 'console';
  private readonly log = new Logger('AuthCode');

  async send(
    method: TSignInMethod,
    target: string,
    code: string,
    meta?: ICodeSendMeta,
  ): Promise<void> {
    const ttl = meta?.ttlSeconds ?? LIMITS.codeTtlSeconds;
    this.log.warn(`[DEV ONLY] ${method} ${target} - code: ${code} (ttl ${ttl}s)`);
  }

  /** Thư báo đăng nhập lạ, bản dev. Model/os là chữ của app gửi lên — lọc về ASCII. */
  async sendLoginAlert(to: string, alert: ILoginAlert): Promise<void> {
    this.log.warn(
      `[DEV ONLY] login alert to ${to}: device=${toAsciiLog(alert.model)} ${toAsciiLog(alert.os)} country=${alert.country ?? '-'}`,
    );
  }
}
