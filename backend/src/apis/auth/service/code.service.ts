import { HttpStatus, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import argon2 from 'argon2';
import { ERR, LIMITS, type TSignInMethod } from '@nook/shared';
import { AppException } from '../../../core/error/index.js';
import { RedisService } from '../../../infra/redis/service/index.js';

/**
 * Sổ khoá Redis của phần mã đăng nhập. Để ngoài lớp cho dễ đối chiếu khi phải
 * cầm `redis-cli` soi lúc nửa đêm.
 *
 *   auth:code:<kind>:<target>     băm { hash, tries, sentAt }   TTL 300s
 *   auth:resend:<kind>:<target>   chốt chặn gửi lại              TTL  60s
 *   auth:hour:<kind>:<target>     con đếm số mã trong một giờ    TTL 3600s
 */
const KEY = {
  code: (method: TSignInMethod, target: string) => `auth:code:${method}:${target}`,
  resend: (method: TSignInMethod, target: string) => `auth:resend:${method}:${target}`,
  callerHour: (ip: string) => `auth:hour:ip:${ip}`,
  hour: (method: TSignInMethod, target: string) => `auth:hour:${method}:${target}`,
} as const;

const HOUR_SECONDS = 3_600;

/**
 * Mã 6 số: sinh, cất, đối chiếu.
 *
 * **Mã sống trong Redis, không sống trong Postgres.** Ba lý do, theo thứ tự
 * quan trọng:
 *
 * 1. Nó tự chết. `EXPIRE 300` là hết hạn thật, không cần ai đi dọn.
 * 2. Postgres không quên. Ghi vào đó là mã còn nằm trong WAL và trong mọi bản
 *    sao lưu — "đã xoá" ở Postgres không có nghĩa là đã biến mất.
 * 3. Đếm số lần gõ sai là việc ghi liên tục vào một dòng. Postgres làm được,
 *    nhưng đó là bắt xe tải chở một lá thư.
 *
 * Cất là **dấu vân** của mã, không phải mã. Ai đọc được Redis cũng không đăng
 * nhập thay ai được.
 */
@Injectable()
export class CodeService {
  /** Giới hạn lấy từ @nook/shared — app và server đọc CÙNG một con số. */
  readonly limits = {
    length: LIMITS.codeLength,
    ttlSeconds: LIMITS.codeTtlSeconds,
    maxTries: LIMITS.codeMaxTries,
    resendSeconds: LIMITS.codeResendSeconds,
    perHour: LIMITS.codesPerHour,
    perHourPerIp: LIMITS.codesPerHourPerIp,
  } as const;

  constructor(private readonly redis: RedisService) {}

  /**
   * Trần theo MÁY GỌI, không theo email.
   *
   * Phải gọi TRƯỚC mọi việc có thể lộ ra "email này đã có tài khoản chưa".
   * Mấy trần kia khoá theo email nên kẻ gõ mỗi lần một email khác đi qua thoải
   * mái — mà đó đúng là hình dạng của việc quét danh sách. Cái này mới cản.
   *
   * Không biết IP (gọi từ trong máy, hoặc chạy thử) thì bỏ qua: thà không chặn
   * còn hơn dồn cả thiên hạ vào chung một cái xô rồi khoá nhầm người thật.
   */
  async guardCaller(ip: string | null): Promise<void> {
    if (!ip) return;

    const key = KEY.callerHour(ip);
    const used = await this.redis.client.incr(key);
    if (used === 1) await this.redis.client.expire(key, HOUR_SECONDS);

    if (used > this.limits.perHourPerIp) {
      throw new AppException(ERR.CODE_TOO_MANY_HERE, HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: Math.max(await this.redis.ttl(key), 1),
      });
    }
  }

  /**
   * Sinh mã mới và cất. Trả về mã ở dạng THÔ để bên gửi mang đi — đây là chỗ
   * duy nhất trong cả server nhìn thấy mã chưa băm.
   */
  async issue(method: TSignInMethod, target: string): Promise<string> {
    const resendKey = KEY.resend(method, target);

    // Chốt gửi lại. `SET … NX EX` là MỘT lệnh: kiểm và đặt không tách rời nhau,
    // nên hai lần bấm cùng lúc chỉ một lần lọt qua. Kiểm trước rồi đặt sau thì
    // giữa hai bước có khe, và người ta bấm nhanh hơn ta tưởng.
    const locked = await this.redis.client.set(resendKey, '1', 'EX', this.limits.resendSeconds, 'NX');
    if (locked === null) {
      throw new AppException(ERR.CODE_TOO_SOON, HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: Math.max(await this.redis.ttl(resendKey), 1),
      });
    }

    // Trần theo giờ. Chốt trên chỉ chặn bấm dồn; chốt này chặn kiên trì cả buổi.
    const hourKey = KEY.hour(method, target);
    const sent = await this.redis.client.incr(hourKey);
    if (sent === 1) await this.redis.client.expire(hourKey, HOUR_SECONDS);
    if (sent > this.limits.perHour) {
      // Trả lại chốt gửi lại: người ta phải chờ hết GIỜ, và con số đếm ngược
      // hiện trên màn phải là con số thật, không phải 60 giây gây hiểu nhầm.
      await this.redis.del(resendKey);
      throw new AppException(ERR.CODE_TOO_MANY, HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: Math.max(await this.redis.ttl(hourKey), 1),
      });
    }

    // `randomInt` của node:crypto, KHÔNG phải `Math.random`. Math.random đoán
    // được: biết vài giá trị trước là suy ra giá trị sau.
    const code = String(randomInt(0, 10 ** this.limits.length)).padStart(this.limits.length, '0');

    const codeKey = KEY.code(method, target);
    await this.redis.client.hset(codeKey, {
      hash: await argon2.hash(code),
      tries: 0,
      sentAt: Date.now(),
    });
    await this.redis.client.expire(codeKey, this.limits.ttlSeconds);

    return code;
  }

  /** Đối chiếu mã người dùng gõ. Đúng thì huỷ mã luôn — mỗi mã dùng một lần. */
  async consume(method: TSignInMethod, target: string, code: string): Promise<void> {
    const codeKey = KEY.code(method, target);
    const row = await this.redis.client.hgetall(codeKey);

    // Không có gì trong kho nghĩa là mã đã hết hạn (hoặc chưa từng xin).
    // ĐỪNG gộp với "sai": hai chuyện đó khác nhau, và app hiện hai câu khác nhau.
    if (!row.hash) throw new AppException(ERR.CODE_EXPIRED, HttpStatus.GONE);

    if (Number(row.tries ?? 0) >= this.limits.maxTries) {
      await this.redis.del(codeKey);
      throw new AppException(ERR.CODE_LOCKED, HttpStatus.TOO_MANY_REQUESTS);
    }

    if (!(await argon2.verify(row.hash, code))) {
      const tried = await this.redis.client.hincrby(codeKey, 'tries', 1);
      const triesLeft = Math.max(this.limits.maxTries - tried, 0);
      if (triesLeft === 0) await this.redis.del(codeKey);
      throw new AppException(ERR.CODE_INVALID, HttpStatus.BAD_REQUEST, { triesLeft });
    }

    // Đúng rồi thì mã chết ngay. Mở luôn chốt gửi lại — người vừa đăng nhập
    // xong mà đăng xuất rồi vào lại thì không có lý do gì phải chờ 60 giây.
    await this.redis.del(codeKey, KEY.resend(method, target));
  }

  /**
   * Huỷ mã đang treo và mở chốt gửi lại.
   *
   * Dùng khi GỬI HỎNG: người dùng không được ngồi chờ 60 giây cho một mã không
   * bao giờ tới nơi.
   */
  async drop(method: TSignInMethod, target: string): Promise<void> {
    await this.redis.del(KEY.code(method, target), KEY.resend(method, target));
  }

  /** Còn bao nhiêu giây nữa mới xin được mã lần sau. 0 nghĩa là xin được ngay. */
  async retryAfterSeconds(method: TSignInMethod, target: string): Promise<number> {
    const ttl = await this.redis.ttl(KEY.resend(method, target));
    return ttl > 0 ? ttl : 0;
  }
}
