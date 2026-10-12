import { describe, expect, it } from 'vitest';
import { ERR, LIMITS } from '@nook/shared';
import { CodeService } from './code.service.js';

/** Redis trong bộ nhớ: chuỗi, băm, TTL bằng giây — đủ mấy lệnh `CodeService` dùng. */
function fakeRedis() {
  const str = new Map<string, string>();
  const hash = new Map<string, Record<string, string>>();
  const ttl = new Map<string, number>();
  const has = (k: string) => str.has(k) || hash.has(k);
  const client = {
    set: async (k: string, v: string, _ex: 'EX', s: number, _nx: 'NX') => {
      if (has(k)) return null;
      str.set(k, v);
      ttl.set(k, s);
      return 'OK';
    },
    incr: async (k: string) => {
      const v = Number(str.get(k) ?? 0) + 1;
      str.set(k, String(v));
      return v;
    },
    expire: async (k: string, s: number) => (ttl.set(k, s), 1),
    hset: async (k: string, data: Record<string, string | number>) => {
      const row = hash.get(k) ?? {};
      for (const [f, v] of Object.entries(data)) row[f] = String(v);
      hash.set(k, row);
      return 1;
    },
    hgetall: async (k: string) => ({ ...(hash.get(k) ?? {}) }),
    hincrby: async (k: string, f: string, by: number) => {
      const row = hash.get(k) ?? {};
      row[f] = String(Number(row[f] ?? 0) + by);
      hash.set(k, row);
      return Number(row[f]);
    },
  };
  const del = async (...keys: string[]) => {
    for (const k of keys) {
      str.delete(k);
      hash.delete(k);
      ttl.delete(k);
    }
    return keys.length;
  };
  return {
    redis: { client, del, ttl: async (k: string) => (has(k) ? (ttl.get(k) ?? -1) : -2) },
    /** Giả thời gian trôi: chỉnh TTL còn lại của một khoá. */
    setTtl: (k: string, s: number) => ttl.set(k, s),
    field: (k: string, f: string) => hash.get(k)?.[f],
    patch: (k: string, f: string, v: string) => {
      const row = hash.get(k);
      if (row) row[f] = v;
    },
    /** Hết chốt 60 giây — như thể người dùng đã chờ đủ. */
    unlock: (method: string, target: string) => del(`auth:resend:${method}:${target}`),
  };
}

function build(secret = 'test-secret-0123456789abcdef') {
  const fake = fakeRedis();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codes = new CodeService(fake.redis as any, { get: () => secret } as any);
  return { codes, fake };
}

const T = 'nam@gmail.com';
const KEY = `auth:code:email:${T}`;

describe('CodeService — gửi lại trong 5 phút là gửi ĐÚNG mã cũ', () => {
  it('lần đầu sinh mã mới, cất băm + hộp, KHÔNG cất mã trần', async () => {
    const { codes, fake } = build();
    const first = await codes.issue('email', T);
    expect(first.reused).toBe(false);
    expect(first.ttlSeconds).toBe(LIMITS.codeTtlSeconds);
    expect(first.code).toMatch(/^\d{6}$/);
    expect(fake.field(KEY, 'box')).toBeTruthy();
    expect(fake.field(KEY, 'box')).not.toContain(first.code);
  });

  it('xin lại khi mã còn sống: cùng mã, TTL còn lại, không gia hạn, không xoá số lần sai', async () => {
    const { codes, fake } = build();
    const first = await codes.issue('email', T);
    await expect(codes.consume('email', T, '000000')).rejects.toMatchObject({
      code: ERR.CODE_INVALID,
    });

    await fake.unlock('email', T);
    fake.setTtl(KEY, 212);
    const again = await codes.issue('email', T);
    expect(again).toEqual({ code: first.code, ttlSeconds: 212, reused: true });
    expect(await fake.redis.ttl(KEY)).toBe(212);
    expect(fake.field(KEY, 'tries')).toBe('1');

    await codes.consume('email', T, first.code);
  });

  it('chốt 60 giây vẫn đứng nguyên', async () => {
    const { codes } = build();
    await codes.issue('email', T);
    await expect(codes.issue('email', T)).rejects.toMatchObject({ code: ERR.CODE_TOO_SOON });
  });

  it('mã sắp chết (< 60 giây) thì cấp mã MỚI, đủ 5 phút', async () => {
    const { codes, fake } = build();
    await codes.issue('email', T);
    await fake.unlock('email', T);
    fake.setTtl(KEY, 45);
    const again = await codes.issue('email', T);
    expect(again.reused).toBe(false);
    expect(again.ttlSeconds).toBe(LIMITS.codeTtlSeconds);
    expect(fake.field(KEY, 'tries')).toBe('0');
  });

  it('hộp hỏng hoặc khoá đổi thì cấp mã mới — không ném', async () => {
    const { codes, fake } = build();
    await codes.issue('email', T);
    await fake.unlock('email', T);
    fake.patch(KEY, 'box', 'rác.rác.rác');
    expect((await codes.issue('email', T)).reused).toBe(false);

    // Cùng kho Redis, khác khoá: hộp mở không được.
    const other = new CodeService(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fake.redis as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { get: () => 'another-secret-0123456789abcdef' } as any,
    );
    await fake.unlock('email', T);
    expect((await other.issue('email', T)).reused).toBe(false);
  });

  it('hộp buộc vào đích: chép sang đích khác thì không mở được', async () => {
    const { codes, fake } = build();
    await codes.issue('email', T);
    const box = fake.field(KEY, 'box')!;
    const other = 'lan@gmail.com';
    await codes.issue('email', other);
    await fake.unlock('email', other);
    fake.patch(`auth:code:email:${other}`, 'box', box);
    expect((await codes.issue('email', other)).reused).toBe(false);
  });

  it('gửi lại hỏng: `keepCode` chỉ mở chốt, mã cũ còn dùng được', async () => {
    const { codes } = build();
    const first = await codes.issue('email', T);
    await codes.drop('email', T, true);
    expect(await codes.retryAfterSeconds('email', T)).toBe(0);
    await codes.consume('email', T, first.code);
  });
});
