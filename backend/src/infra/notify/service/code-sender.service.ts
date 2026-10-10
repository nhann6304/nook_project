import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TSignInMethod } from '@nook/shared';
import { CodeSenderKind, Env, SmsSenderKind } from '../../../config/env/index.js';
import type { ICodeSender } from '../sender/index.js';
import { ConsoleSender, EsmsSender, SmtpSender, TwilioSender } from '../sender/index.js';

/**
 * Chọn đường gửi theo phương thức: email đi `CODE_SENDER`, số điện thoại đi
 * `SMS_SENDER`. Hai nhà cung cấp, hai hoá đơn, bật tắt độc lập.
 *
 * `AuthService` không biết mã đi bằng đường nào — chỉ hỏi `isOpen()` để trả
 * `auth.method_unavailable` khi SMS đang tắt.
 */
@Injectable()
export class CodeSenderService {
  private readonly email: ICodeSender;
  /** `null` = `SMS_SENDER=off`. */
  private readonly sms: ICodeSender | null;

  constructor(
    config: ConfigService<Env, true>,
    consoleSender: ConsoleSender,
    smtpSender: SmtpSender,
    esmsSender: EsmsSender,
    twilioSender: TwilioSender,
  ) {
    this.email =
      config.get('CODE_SENDER', { infer: true }) === CodeSenderKind.smtp
        ? smtpSender
        : consoleSender;

    const sms: Record<SmsSenderKind, ICodeSender | null> = {
      [SmsSenderKind.off]: null,
      [SmsSenderKind.console]: consoleSender,
      [SmsSenderKind.esms]: esmsSender,
      [SmsSenderKind.twilio]: twilioSender,
    };
    this.sms = sms[config.get('SMS_SENDER', { infer: true })] ?? null;
  }

  /** Phương thức này có đường gửi không. */
  isOpen(method: TSignInMethod): boolean {
    return method === 'email' || this.sms !== null;
  }

  send(method: TSignInMethod, target: string, code: string): Promise<void> {
    const sender = method === 'email' ? this.email : this.sms;
    if (!sender) return Promise.reject(new Error('SMS_SENDER=off: no transport for phone'));
    return sender.send(method, target, code);
  }
}
