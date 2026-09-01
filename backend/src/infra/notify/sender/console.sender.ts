import { Injectable, Logger } from '@nestjs/common';
import type { TSignInMethod } from '@nook/shared';
import type { ICodeSender } from './code-sender.interface.js';

/**
 * In mã ra log. **Chỉ dùng khi dev.**
 *
 * `validateEnv` không cho `CODE_SENDER=console` đi kèm bản thật — nhưng đây là
 * loại nhầm lẫn đắt tới mức đáng chặn hai lớp, nên lớp này cũng tự kêu.
 */
@Injectable()
export class ConsoleSender implements ICodeSender {
  readonly kind = 'console';
  private readonly log = new Logger('AuthCode');

  async send(method: TSignInMethod, target: string, code: string): Promise<void> {
    this.log.warn(`[DEV ONLY] ${method} ${target} - code: ${code}`);
  }
}
