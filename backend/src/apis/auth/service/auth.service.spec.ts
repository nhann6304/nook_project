import { describe, expect, it, vi } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { ERR } from '@nook/shared';
import { AppException } from '../../../core/error/app.exception.js';
import { AuthService } from './auth.service.js';

/**
 * Cổng của đường số điện thoại: đóng khi chưa cắm nhà mạng SMS, và chỉ nhận số
 * di động Việt Nam (chặn SMS pumping). Cả hai phải chặn TRƯỚC khi đụng trần
 * hay cấp mã — `codes` ở đây đếm xem có ai bị gọi oan không.
 */
function build(smsOpen: boolean) {
  const codes = {
    guardCaller: vi.fn(async () => undefined),
    issue: vi.fn(async () => '123456'),
    drop: vi.fn(async () => undefined),
    limits: { resendSeconds: 60, ttlSeconds: 300, length: 6 },
  };
  const sender = {
    isOpen: (method: string) => method === 'email' || smsOpen,
    send: vi.fn(async () => undefined),
  };
  const users = { hasIdentity: vi.fn(async () => false) };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const any = (x: unknown) => x as any;
  const service = new AuthService(
    any(codes),
    any({ assertUsable: async () => undefined }),
    any({}),
    any(users),
    any({}),
    any(sender),
  );
  return { service, codes, sender };
}

async function errorOf(p: Promise<unknown>): Promise<[string, number]> {
  try {
    await p;
  } catch (error) {
    if (error instanceof AppException) return [error.code, error.getStatus()];
    throw error;
  }
  throw new Error('expected an AppException');
}

describe('AuthService — đường số điện thoại', () => {
  it('SMS_SENDER=off -> auth.method_unavailable, chưa đụng trần nào', async () => {
    const { service, codes } = build(false);
    expect(
      await errorOf(service.sendCode({ method: 'phone', target: '0901234567' }, '1.2.3.4')),
    ).toEqual([ERR.METHOD_UNAVAILABLE, HttpStatus.BAD_REQUEST]);
    expect(codes.guardCaller).not.toHaveBeenCalled();
    expect(codes.issue).not.toHaveBeenCalled();
  });

  it('chuẩn hoá mọi cách gõ số Việt Nam về E.164', async () => {
    for (const raw of ['0901234567', '+84901234567', '090 123 4567', '84901234567']) {
      const { service, sender } = build(true);
      await service.sendCode({ method: 'phone', target: raw }, null);
      expect(sender.send).toHaveBeenCalledWith('phone', '+84901234567', '123456');
    }
  });

  it('từ chối số nước ngoài và số bàn — auth.target_invalid, không cấp mã', async () => {
    for (const raw of [
      '+14155552671',
      '+447911123456',
      '+8613800138000',
      '02439999999',
      '0181234567',
    ]) {
      const { service, codes } = build(true);
      expect(await errorOf(service.sendCode({ method: 'phone', target: raw }, null))).toEqual([
        ERR.TARGET_INVALID,
        HttpStatus.BAD_REQUEST,
      ]);
      expect(codes.issue).not.toHaveBeenCalled();
    }
  });

  it('SMS tắt không làm hỏng đường email', async () => {
    const { service, sender } = build(false);
    await service.sendCode({ method: 'email', target: 'Nam@Gmail.com' }, null);
    expect(sender.send).toHaveBeenCalledWith('email', 'nam@gmail.com', '123456');
  });
});
