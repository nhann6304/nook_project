import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { DataSource } from 'typeorm';
import { HttpStatus } from '@nestjs/common';
import argon2 from 'argon2';
import { ERR, LIMITS } from '@nook/shared';
import { AppException } from '../../../core/error/app.exception.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './password.service.js';
import { TransactionService } from '../../../core/transaction/transaction.service.js';

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
    any({}),
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const any = (x: unknown) => x as any;

/** Redis trong bộ nhớ — đủ mấy lệnh `PasswordService` dùng. */
function fakeRedis() {
  const store = new Map<string, number>();
  const ttls = new Map<string, number>();
  const client = {
    incr: async (k: string) => {
      const v = (store.get(k) ?? 0) + 1;
      store.set(k, v);
      return v;
    },
    get: async (k: string) => (store.has(k) ? String(store.get(k)) : null),
    expire: async (k: string, s: number) => {
      ttls.set(k, s);
      return 1;
    },
  };
  return {
    client,
    ttl: async (k: string) => ttls.get(k) ?? -2,
    del: async (...keys: string[]) => {
      keys.forEach((k) => {
        store.delete(k);
        ttls.delete(k);
      });
      return keys.length;
    },
  };
}

/**
 * Mật khẩu: `PasswordService` THẬT (argon2 thật, Redis giả), kho người dùng giả
 * một tài khoản `nam@gmail.com`. `hash` = `null` là tài khoản chưa đặt mật khẩu.
 */
async function buildPw(opts: { hash: string | null }) {
  const user = { id: 'u1', onboardedAt: null };
  const codes = {
    guardVerifyCaller: vi.fn(async () => undefined),
    consume: vi.fn(async () => undefined),
  };
  const users = {
    hasIdentity: vi.fn(async (_m: string, t: string) => t === 'nam@gmail.com'),
    findByIdentity: vi.fn(async (_m: string, t: string) => (t === 'nam@gmail.com' ? user : null)),
    passwordHashOf: vi.fn(async () => opts.hash),
    setPasswordHash: vi.fn(async () => undefined),
    createWithPassword: vi.fn(async () => user),
  };
  const sessions = {
    open: vi.fn(async () => ({ accessToken: 'a', refreshToken: 'r', expiresInSeconds: 900 })),
    closeAll: vi.fn(async () => undefined),
  };
  const passwords = new PasswordService(any(fakeRedis()));
  const service = new AuthService(
    any(codes),
    any({}),
    any(sessions),
    any(users),
    any({ toDto: (u: unknown) => u }),
    any({ isOpen: () => true }),
    passwords,
  );
  return { service, codes, users, sessions };
}
describe('AuthService — mật khẩu', () => {
  beforeAll(() => {
    // `@Transactional()` cần một TransactionService đã dựng; giao dịch giả chỉ chạy thẳng.
    const fake = { transaction: (work: (m: unknown) => Promise<unknown>) => work({}) };
    new TransactionService(fake as unknown as DataSource);
  });

  const login = (password: string, target = 'nam@gmail.com') =>
    ({ method: 'email', target, password }) as const;
  const withCode = (password: string, target = 'nam@gmail.com') =>
    ({ method: 'email', target, code: '123456', password }) as const;

  it('mật khẩu ngắn/dài -> auth.password_weak, mã CHƯA bị đốt', async () => {
    const { service, codes } = await buildPw({ hash: null });
    for (const pw of ['a'.repeat(LIMITS.passwordMin - 1), 'a'.repeat(LIMITS.passwordMax + 1)]) {
      expect(await errorOf(service.signup(withCode(pw, 'moi@gmail.com'), null))).toEqual([
        ERR.PASSWORD_WEAK,
        HttpStatus.BAD_REQUEST,
      ]);
      expect(await errorOf(service.resetPassword(withCode(pw), null))).toEqual([
        ERR.PASSWORD_WEAK,
        HttpStatus.BAD_REQUEST,
      ]);
    }
    expect(codes.consume).not.toHaveBeenCalled();
  });

  it('signup vào đích đã có chủ -> auth.account_exists, mã chưa bị đốt', async () => {
    const { service, codes } = await buildPw({ hash: null });
    expect(await errorOf(service.signup(withCode('mat-khau-dai'), null))).toEqual([
      ERR.ACCOUNT_EXISTS,
      HttpStatus.CONFLICT,
    ]);
    expect(codes.consume).not.toHaveBeenCalled();
  });

  it('sai mật khẩu và không có tài khoản -> CÙNG auth.wrong_credentials', async () => {
    const { service } = await buildPw({ hash: await argon2.hash('mat-khau-dung') });
    expect(await errorOf(service.login(login('mat-khau-sai'), null))).toEqual([
      ERR.WRONG_CREDENTIALS,
      HttpStatus.UNAUTHORIZED,
    ]);
    expect(await errorOf(service.login(login('mat-khau-dung', 'ai@gmail.com'), null))).toEqual([
      ERR.WRONG_CREDENTIALS,
      HttpStatus.UNAUTHORIZED,
    ]);
    const ok = await service.login(login('mat-khau-dung'), null);
    expect(ok.refreshToken).toBe('r');
    expect(ok.isNew).toBe(true); // chưa qua màn Tên + ảnh
  });

  it('chưa đặt mật khẩu -> auth.password_not_set', async () => {
    const { service } = await buildPw({ hash: null });
    expect(await errorOf(service.login(login('mat-khau-gi-do'), null))).toEqual([
      ERR.PASSWORD_NOT_SET,
      HttpStatus.CONFLICT,
    ]);
  });

  it(`sai ${LIMITS.passwordMaxFails} lần -> auth.login_locked, kể cả khi gõ đúng`, async () => {
    const { service, sessions } = await buildPw({ hash: await argon2.hash('mat-khau-dung') });
    for (let i = 0; i < LIMITS.passwordMaxFails; i += 1) {
      expect((await errorOf(service.login(login('mat-khau-sai'), null)))[0]).toBe(
        ERR.WRONG_CREDENTIALS,
      );
    }
    const locked = service.login(login('mat-khau-dung'), null);
    await expect(locked).rejects.toMatchObject({
      code: ERR.LOGIN_LOCKED,
      detail: { retryAfterSeconds: LIMITS.passwordLockSeconds },
    });
    expect(sessions.open).not.toHaveBeenCalled();
  }, 20_000);

  it('đích chưa có tài khoản cũng bị khoá — không thì `login_locked` lộ ai có tài khoản', async () => {
    const { service } = await buildPw({ hash: null });
    for (let i = 0; i < LIMITS.passwordMaxFails; i += 1) {
      await errorOf(service.login(login('x'.repeat(8), 'ai@gmail.com'), null));
    }
    expect((await errorOf(service.login(login('x'.repeat(8), 'ai@gmail.com'), null)))[0]).toBe(
      ERR.LOGIN_LOCKED,
    );
  }, 20_000);

  it('đặt lại: thu hồi MỌI phiên cũ trước khi mở phiên mới, và mở khoá đăng nhập', async () => {
    const { service, users, sessions, codes } = await buildPw({
      hash: await argon2.hash('mat-khau-cu'),
    });
    for (let i = 0; i < LIMITS.passwordMaxFails; i += 1) {
      await errorOf(service.login(login('mat-khau-sai'), null));
    }

    await service.resetPassword(withCode('mat-khau-moi-dai'), null);
    expect(codes.consume).toHaveBeenCalledOnce();
    expect(users.setPasswordHash).toHaveBeenCalledWith('u1', expect.stringMatching(/^\$argon2/));
    expect(sessions.closeAll).toHaveBeenCalledWith('u1');
    expect(sessions.closeAll.mock.invocationCallOrder[0]).toBeLessThan(
      sessions.open.mock.invocationCallOrder[0]!,
    );

    // Khoá đã gỡ: lần này tới được bước đối chiếu (hash trong kho giả vẫn là cũ).
    expect((await errorOf(service.login(login('mat-khau-moi-dai'), null)))[0]).toBe(
      ERR.WRONG_CREDENTIALS,
    );
  }, 20_000);

  it('đặt lại cho đích chưa có tài khoản -> auth.account_not_found', async () => {
    const { service, codes } = await buildPw({ hash: null });
    expect(
      await errorOf(service.resetPassword(withCode('mat-khau-dai', 'ai@gmail.com'), null)),
    ).toEqual([ERR.ACCOUNT_NOT_FOUND, HttpStatus.CONFLICT]);
    expect(codes.consume).not.toHaveBeenCalled();
  });
});
