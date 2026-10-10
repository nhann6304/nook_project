import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TSignInMethod } from '@nook/shared';
import { Env } from '../../../config/env/index.js';
import type { ICodeSender } from './code-sender.interface.js';
import { SMS_TIMEOUT_MS, maskPhone, smsCodeText, toAsciiLog } from './sms.util.js';

const TWILIO_API = 'https://api.twilio.com/2010-04-01/Accounts';

interface ITwilioError {
  code?: number;
  message?: string;
}

/**
 * Gửi mã qua Twilio Programmable Messaging. Gọi thẳng REST bằng `fetch`, không
 * kéo SDK của Twilio về chỉ để gửi một câu.
 */
@Injectable()
export class TwilioSender implements ICodeSender {
  readonly kind = 'twilio';
  private readonly log = new Logger('Twilio');

  constructor(private readonly config: ConfigService<Env, true>) {}

  async send(method: TSignInMethod, target: string, code: string): Promise<void> {
    if (method !== 'phone') throw new Error('Twilio only sends to phone numbers');

    const sid = this.config.get('TWILIO_ACCOUNT_SID', { infer: true }) ?? '';
    const token = this.config.get('TWILIO_AUTH_TOKEN', { infer: true }) ?? '';
    const service = this.config.get('TWILIO_MESSAGING_SERVICE_SID', { infer: true });

    const form = new URLSearchParams({ To: target, Body: smsCodeText(code) });
    if (service) form.set('MessagingServiceSid', service);
    else form.set('From', this.config.get('TWILIO_FROM', { infer: true }) ?? '');

    const res = await fetch(`${TWILIO_API}/${encodeURIComponent(sid)}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: AbortSignal.timeout(SMS_TIMEOUT_MS),
      body: form.toString(),
    });

    if (!res.ok) {
      // Không log `message` của Twilio: nó hay chép nguyên số điện thoại vào.
      const err = (await res.json().catch(() => ({}))) as ITwilioError;
      this.log.error(
        `send to ${maskPhone(target)} failed: http=${res.status} code=${toAsciiLog(err.code)}`,
      );
      throw new Error(`Twilio rejected the message (http=${res.status})`);
    }

    this.log.debug(`code sent to ${maskPhone(target)}`);
  }
}
