import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { LIMITS, type TSignInMethod } from '@nook/shared';
import { Env } from '../../../config/env/index.js';
import type { ICodeSender } from './code-sender.interface.js';

/**
 * Gửi mã qua email thật.
 *
 * Chữ trong thư nằm ở đây chứ không lấy từ kho chữ của app — thư đi ra ngoài
 * hệ thống, người nhận có khi chưa cài app. Đây là ngoại lệ DUY NHẤT của luật
 * "server không viết câu tiếng Việt", và nó đúng vì không có app nào ở đầu bên
 * kia để tra bảng chữ.
 */
@Injectable()
export class SmtpSender implements ICodeSender {
  readonly kind = 'smtp';
  private readonly log = new Logger('SMTP');
  private readonly from: string;
  private transport: Transporter | null = null;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.from = this.config.get('SMTP_FROM', { infer: true }) ?? 'Nook <no-reply@nook.app>';
  }

  async send(method: TSignInMethod, target: string, code: string): Promise<void> {
    // `CodeSenderService` chỉ đưa email tới đây; SMS đi đường `SMS_SENDER`.
    if (method !== 'email') throw new Error('SMTP only sends to email addresses');

    const minutes = Math.round(LIMITS.codeTtlSeconds / 60);
    await this.transporter().sendMail({
      from: this.from,
      to: target,
      subject: `Mã đăng nhập Nook: ${code}`,
      text: `Mã của bạn là ${code}. Mã sống trong ${minutes} phút.\n\nKhông phải bạn xin mã này? Bỏ qua thư này là xong.`,
    });

    this.log.debug(`code sent to ${target}`);
  }

  /** Dựng lúc cần chứ không lúc bật server: dev không có SMTP thì cũng chạy được. */
  private transporter(): Transporter {
    this.transport ??= createTransport(this.config.get('SMTP_URL', { infer: true }));
    return this.transport;
  }
}
