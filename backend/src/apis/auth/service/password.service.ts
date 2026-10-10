import { HttpStatus, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import { ERR, LIMITS, isPasswordLongEnough, type TSignInMethod } from '@nook/shared';
import { AppException } from '../../../core/error/index.js';
import { RedisService } from '../../../infra/redis/service/index.js';
import { identityKey } from '../../../repository/user/index.js';

/**
 *   auth:login:ip:<ip>                 con đếm số lần đăng nhập theo máy gọi   TTL 3600s
 *   auth:pwfail:<kind>:<value_key>     con đếm sai mật khẩu theo đích          TTL 900s
 */
const KEY = {
  loginHour: (ip: string) => `auth:login:ip:${ip}`,
  // `value_key`, không phải chuỗi gõ: `nam+1@` và `nam+2@` là một hộp thư —
  // khoá theo chuỗi gõ thì mỗi nhãn `+` được thêm 10 lần đoán.
  fails: (method: TSignInMethod, target: string) =>
    `auth:pwfail:${method}:${identityKey(method, target)}`,
} as const;

const HOUR_SECONDS = 3_600;

/**
 * Mật khẩu: băm, đối chiếu, và hai cái trần chống đoán.
 *
 * Mật khẩu dùng ARGON2 (khác mã 6 số dùng HMAC — xem `CodeService`): nó sống
 * nhiều năm và người ta dùng lại ở trang khác, nên bảng bị đọc trộm thì mỗi lần
 * đoán phải tốn kém thật.
 *
 * Con đếm sai đếm CẢ đích chưa có tài khoản: chỉ khoá đích có thật thì
 * `auth.login_locked` thành cách dò "email này có dùng Nook không".
 */
@Injectable()
export class PasswordService {
  readonly limits = {
    maxFails: LIMITS.passwordMaxFails,
    lockSeconds: LIMITS.passwordLockSeconds,
    loginPerHourPerIp: LIMITS.loginPerHourPerIp,
  } as const;

  /** Băm sẵn một chuỗi ngẫu nhiên cho `verifyDummy`. Lười: chỉ băm lần đầu cần. */
  private dummy: Promise<string> | null = null;

  constructor(private readonly redis: RedisService) {}

  /** Gọi LẠI luật độ dài bên `@nook/shared` — không tin app đã kiểm. */
  assertStrong(password: string): void {
    if (!isPasswordLongEnough(password)) {
      throw new AppException(ERR.PASSWORD_WEAK, HttpStatus.BAD_REQUEST);
    }
  }

  hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  /**
   * Đối chiếu với một dấu vân không của ai, kết quả bỏ đi. Đích không có tài
   * khoản mà trả lời ngay thì nhanh hơn hẳn đường thật (~50 ms argon2) — đo
   * thời gian là biết email nào có tài khoản.
   */
  async verifyDummy(password: string): Promise<void> {
    this.dummy ??= argon2.hash(randomBytes(16).toString('hex'));
    await argon2.verify(await this.dummy, password);
  }

  /** Trần đăng nhập theo MÁY GỌI — chặn rải đoán qua nhiều tài khoản. */
  async guardCaller(ip: string | null): Promise<void> {
    if (!ip) return;

    const key = KEY.loginHour(ip);
    const used = await this.redis.client.incr(key);
    if (used === 1) await this.redis.client.expire(key, HOUR_SECONDS);

    if (used > this.limits.loginPerHourPerIp) {
      throw new AppException(ERR.LOGIN_TOO_MANY_HERE, HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: Math.max(await this.redis.ttl(key), 1),
      });
    }
  }

  /** Đích đang bị khoá vì sai quá nhiều thì dừng ở đây — chưa tốn một lần băm. */
  async assertNotLocked(method: TSignInMethod, target: string): Promise<void> {
    const key = KEY.fails(method, target);
    const fails = Number((await this.redis.client.get(key)) ?? 0);
    if (fails >= this.limits.maxFails) {
      throw new AppException(ERR.LOGIN_LOCKED, HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: Math.max(await this.redis.ttl(key), 1),
      });
    }
  }

  /**
   * Ghi một lần sai. Chạm trần thì hạn khoá tính lại từ LẦN SAI CUỐI — không thì
   * kẻ đoán canh cuối khung 15 phút mà dồn 10 lần, khoá chỉ còn vài giây.
   */
  async recordFailure(method: TSignInMethod, target: string): Promise<void> {
    const key = KEY.fails(method, target);
    const fails = await this.redis.client.incr(key);
    if (fails === 1 || fails >= this.limits.maxFails) {
      await this.redis.client.expire(key, this.limits.lockSeconds);
    }
  }

  async clearFailures(method: TSignInMethod, target: string): Promise<void> {
    await this.redis.del(KEY.fails(method, target));
  }
}
