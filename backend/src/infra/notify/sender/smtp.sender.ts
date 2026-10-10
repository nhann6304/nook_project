import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { LIMITS, type TSignInMethod } from '@nook/shared';
import { CodeSenderKind, Env } from '../../../config/env/index.js';
import type { ICodeSender } from './code-sender.interface.js';

/**
 * Gửi mã qua email thật.
 *
 * Chữ trong thư nằm ở đây chứ không lấy từ kho chữ của app — thư đi ra ngoài
 * hệ thống, người nhận có khi chưa cài app. Đây là ngoại lệ DUY NHẤT của luật
 * "server không viết câu tiếng Việt", và nó đúng vì không có app nào ở đầu bên
 * kia để tra bảng chữ.
 *
 * Giới hạn thời gian NGẮN (10/10/2026): mặc định của nodemailer chờ tới 2
 * phút khi cổng SMTP bị chặn — app đứng 15 giây rồi báo "mạng chậm", server
 * thì im. Giờ hỏng là hỏng trong vài giây, log nói rõ hỏng ở đâu, và lúc bật
 * server đã thử kết nối Gmail một lần để biết sớm.
 */
const SMTP_TIMEOUT_MS = { connect: 8_000, greeting: 8_000, socket: 12_000 } as const;
@Injectable()
export class SmtpSender implements ICodeSender, OnApplicationBootstrap {
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
    const started = Date.now();
    try {
      await this.transporter().sendMail({
        from: this.from,
        to: target,
        subject: `Mã đăng nhập LOVO: ${code}`,
        text: `Mã của bạn là ${code}. Mã sống trong ${minutes} phút.\n\nKhông phải bạn xin mã này? Bỏ qua thư này là xong.`,
      });
    } catch (e) {
      this.log.error(`send failed after ${Date.now() - started}ms: ${describe(e)}`);
      throw e;
    }
    this.log.log(`code sent to ${mask(target)} in ${Date.now() - started}ms`);
  }

  /** Thử nối SMTP một lần lúc bật — sai mật khẩu / cổng bị chặn thì biết NGAY. */
  onApplicationBootstrap(): void {
    if (this.config.get('CODE_SENDER', { infer: true }) !== CodeSenderKind.smtp) return;
    this.transporter()
      .verify()
      .then(() => this.log.log('SMTP ready'))
      .catch((e: unknown) => this.log.error(`SMTP not usable: ${describe(e)}`));
  }

  /** Dựng lúc cần chứ không lúc bật server: dev không có SMTP thì cũng chạy được. */
  private transporter(): Transporter {
    this.transport ??= createTransport(this.config.get('SMTP_URL', { infer: true }), {
      connectionTimeout: SMTP_TIMEOUT_MS.connect,
      greetingTimeout: SMTP_TIMEOUT_MS.greeting,
      socketTimeout: SMTP_TIMEOUT_MS.socket,
    });
    return this.transport;
  }
}

/** Câu lỗi + mã của nodemailer (EAUTH = sai mật khẩu, ETIMEDOUT/ECONNECTION = cổng bị chặn). */
function describe(e: unknown): string {
  if (!(e instanceof Error)) return String(e);
  const code = (e as Error & { code?: string }).code;
  const hint =
    code === 'EAUTH'
      ? ' (wrong Gmail app password or address)'
      : code === 'ETIMEDOUT' || code === 'ECONNECTION' || code === 'ESOCKET'
        ? ' (SMTP port blocked - try port 587: smtp://...@smtp.gmail.com:587)'
        : '';
  return `${code ?? 'ERR'} ${e.message}${hint}`;
}

function mask(email: string): string {
  const [name = '', domain = ''] = email.split('@');
  return `${name.slice(0, 2)}***@${domain}`;
}
