import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { CodeSenderKind, SmsSenderKind } from '../../../config/env/index.js';
import { CodeSenderService } from './code-sender.service.js';

/** Email đi `CODE_SENDER`, số điện thoại đi `SMS_SENDER` — không bao giờ lẫn. */
function build(codeSender: CodeSenderKind, smsSender: SmsSenderKind) {
  const env: Record<string, string> = { CODE_SENDER: codeSender, SMS_SENDER: smsSender };
  const fake = (kind: string) => ({
    kind,
    send: vi.fn(async () => undefined),
    sendLoginAlert: vi.fn(async () => undefined),
  });
  const s = {
    console: fake('console'),
    smtp: fake('smtp'),
    esms: fake('esms'),
    twilio: fake('twilio'),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const any = (x: unknown) => x as any;
  const service = new CodeSenderService(
    any({ get: (k: string) => env[k] }),
    any(s.console),
    any(s.smtp),
    any(s.esms),
    any(s.twilio),
  );
  return { service, s };
}

describe('CodeSenderService', () => {
  it('email -> SMTP, số điện thoại -> eSMS', async () => {
    const { service, s } = build(CodeSenderKind.smtp, SmsSenderKind.esms);
    const meta = { intent: 'signin', ttlSeconds: 212 } as const;
    await service.send('email', 'nam@gmail.com', '111111', meta);
    await service.send('phone', '+84901234567', '222222');
    expect(s.smtp.send).toHaveBeenCalledWith('email', 'nam@gmail.com', '111111', meta);
    expect(s.esms.send).toHaveBeenCalledWith('phone', '+84901234567', '222222', undefined);
    expect(s.console.send).not.toHaveBeenCalled();
    expect(s.twilio.send).not.toHaveBeenCalled();
  });

  it('số điện thoại -> Twilio khi SMS_SENDER=twilio', async () => {
    const { service, s } = build(CodeSenderKind.console, SmsSenderKind.twilio);
    await service.send('phone', '+84901234567', '333333');
    expect(s.twilio.send).toHaveBeenCalledOnce();
    expect(s.console.send).not.toHaveBeenCalled();
  });

  it('console phục vụ cả hai đường khi dev', async () => {
    const { service, s } = build(CodeSenderKind.console, SmsSenderKind.console);
    await service.send('email', 'nam@gmail.com', '1');
    await service.send('phone', '+84901234567', '2');
    expect(s.console.send).toHaveBeenCalledTimes(2);
  });

  it('SMS_SENDER=off: đóng đường số điện thoại, email vẫn mở', async () => {
    const { service, s } = build(CodeSenderKind.smtp, SmsSenderKind.off);
    expect(service.isOpen('email')).toBe(true);
    expect(service.isOpen('phone')).toBe(false);
    await expect(service.send('phone', '+84901234567', '4')).rejects.toThrow();
    expect(s.console.send).not.toHaveBeenCalled();
  });

  it('thư báo đăng nhập lạ đi cùng đường với thư mã', async () => {
    const alert = { model: 'Pixel 8', os: 'android 15', country: 'US', at: new Date() };
    const smtp = build(CodeSenderKind.smtp, SmsSenderKind.esms);
    await smtp.service.sendLoginAlert('nam@gmail.com', alert);
    expect(smtp.s.smtp.sendLoginAlert).toHaveBeenCalledWith('nam@gmail.com', alert);

    const dev = build(CodeSenderKind.console, SmsSenderKind.off);
    await dev.service.sendLoginAlert('nam@gmail.com', alert);
    expect(dev.s.console.sendLoginAlert).toHaveBeenCalledOnce();
  });
});
