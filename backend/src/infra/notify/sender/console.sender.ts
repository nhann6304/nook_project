import { Injectable, Logger } from '@nestjs/common';
import type { TSignInMethod } from '@nook/shared';
import type { ICodeSender } from './code-sender.interface.js';

/**
 * In mã ra log — cho cả email lẫn số điện thoại. **Chỉ dùng khi dev.**
 *
 * `validateEnv` không cho `SMS_SENDER=console` đi kèm bản thật. `CODE_SENDER`
 * thì còn cho (cụm Docker staging dùng nó), nên lớp này tự kêu bằng WARN.
 */
@Injectable()
export class ConsoleSender implements ICodeSender {
  readonly kind = 'console';
  private readonly log = new Logger('AuthCode');

  async send(method: TSignInMethod, target: string, code: string): Promise<void> {
    this.log.warn(`[DEV ONLY] ${method} ${target} - code: ${code}`);
  }
}
