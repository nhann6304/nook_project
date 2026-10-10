import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TSignInMethod } from '@nook/shared';
import { Env } from '../../../config/env/index.js';
import type { ICodeSender } from './code-sender.interface.js';
import { SMS_TIMEOUT_MS, maskPhone, smsCodeText, toAsciiLog } from './sms.util.js';

const ESMS_URL = 'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/';

/** Mã eSMS cho "đã nhận gửi". Mọi mã khác là hỏng. */
const ESMS_OK = '100';

/** 2 = tin chăm sóc khách hàng qua brandname — loại dùng cho mã đăng nhập. */
const ESMS_SMS_TYPE = '2';

const VN_PREFIX = '+84';

/** `+84901234567` -> `0901234567`: eSMS nhận số kiểu trong nước. */
export function toVnLocal(e164: string): string {
  return e164.startsWith(VN_PREFIX) ? `0${e164.slice(VN_PREFIX.length)}` : e164;
}

interface IEsmsResponse {
  CodeResult?: string;
  ErrorMessage?: string;
}

/**
 * Gửi mã qua eSMS.vn (brandname).
 *
 * Nội dung tin phải khớp MẪU đã duyệt với nhà mạng; lệch một chữ là eSMS nhận
 * (`100`) mà nhà mạng chặn, tin không tới. Xem backend/README mục 1.
 */
@Injectable()
export class EsmsSender implements ICodeSender {
  readonly kind = 'esms';
  private readonly log = new Logger('eSMS');

  constructor(private readonly config: ConfigService<Env, true>) {}

  async send(method: TSignInMethod, target: string, code: string): Promise<void> {
    if (method !== 'phone') throw new Error('eSMS only sends to phone numbers');

    const res = await fetch(ESMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(SMS_TIMEOUT_MS),
      body: JSON.stringify({
        ApiKey: this.config.get('ESMS_API_KEY', { infer: true }),
        SecretKey: this.config.get('ESMS_SECRET_KEY', { infer: true }),
        Brandname: this.config.get('ESMS_BRANDNAME', { infer: true }),
        Phone: toVnLocal(target),
        Content: smsCodeText(code),
        SmsType: ESMS_SMS_TYPE,
        IsUnicode: '0',
      }),
    });

    // eSMS trả 200 cả khi hỏng; chỉ `CodeResult` nói thật.
    const body = (await res.json().catch(() => ({}))) as IEsmsResponse;
    if (body.CodeResult !== ESMS_OK) {
      this.log.error(
        `send to ${maskPhone(target)} failed: http=${res.status} CodeResult=${toAsciiLog(body.CodeResult)} ErrorMessage=${toAsciiLog(body.ErrorMessage)}`,
      );
      throw new Error(`eSMS rejected the message (CodeResult=${toAsciiLog(body.CodeResult)})`);
    }

    this.log.debug(`code sent to ${maskPhone(target)}`);
  }
}
