import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SignInMethod } from '@nook/shared';
import { CodeSenderKind, Env } from '../../config/env.validation.js';
import type { CodeSender } from './code-sender.interface.js';
import { ConsoleSender } from './console.sender.js';
import { SmtpSender } from './smtp.sender.js';

/**
 * Chọn đường gửi theo `CODE_SENDER`, rồi đứng ra làm cửa duy nhất cho bên gọi.
 *
 * `AuthService` không biết mã đi bằng đường nào, và không nên biết — đổi nhà
 * cung cấp là đổi một biến môi trường, không phải sửa luồng đăng nhập.
 */
@Injectable()
export class CodeSenderService {
  private readonly sender: CodeSender;

  constructor(
    config: ConfigService<Env, true>,
    consoleSender: ConsoleSender,
    smtpSender: SmtpSender,
  ) {
    const kind = config.get('CODE_SENDER', { infer: true });
    this.sender = kind === CodeSenderKind.smtp ? smtpSender : consoleSender;
  }

  send(method: SignInMethod, target: string, code: string): Promise<void> {
    return this.sender.send(method, target, code);
  }
}
