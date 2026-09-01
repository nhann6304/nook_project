import { Injectable, Logger } from '@nestjs/common';
import type { SignInMethod } from '@nook/shared';
import type { CodeSender } from './code-sender.interface.js';

/**
 * In mã ra log. **Chỉ dùng khi dev.**
 *
 * `validateEnv` không cho `CODE_SENDER=console` đi kèm bản thật — nhưng đây là
 * loại nhầm lẫn đắt tới mức đáng chặn hai lớp, nên lớp này cũng tự kêu.
 */
@Injectable()
export class ConsoleSender implements CodeSender {
  readonly kind = 'console';
  private readonly log = new Logger('Mã đăng nhập');

  async send(method: SignInMethod, target: string, code: string): Promise<void> {
    this.log.warn(`[CHỈ DÙNG KHI DEV] ${method} → ${target} — mã: ${code}`);
  }
}
