import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { Env } from '../../config/env.validation.js';

/**
 * Một kết nối Redis dùng chung cho cả server.
 *
 * Redis ở dự án này làm năm việc, và chỉ năm việc đó:
 *
 *   1. Mã đăng nhập 6 số, tự chết sau 5 phút.
 *   2. Con đếm chống gọi quá dày.
 *   3. Hàng đợi việc nền (BullMQ).
 *   4. Cầu nối cho socket khi có nhiều bản server chạy song song.
 *   5. **Vị trí** — và cái này phải nói rõ: vị trí KHÔNG BAO GIỜ được chạm
 *      vào Postgres. Đặt `EXPIRE 900` là 15 phút sau nó biến mất thật. Ghi vào
 *      Postgres thì nó còn nằm trong WAL và trong mọi bản sao lưu, "đã xoá"
 *      không có nghĩa là đã mất.
 *
 * Việc gì cần NHỚ LÂU thì đi Postgres. Redis là chỗ của thứ được phép quên.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly log = new Logger('Redis');
  readonly client: Redis;

  constructor(config: ConfigService<Env, true>) {
    const url = config.get('REDIS_URL', { infer: true });
    this.client = new Redis(url, {
      // Đừng xếp hàng lệnh khi chưa nối được: xếp hàng là biến "Redis chết"
      // thành "mọi request treo", và treo thì khó tìm hơn hỏng.
      enableOfflineQueue: false,
      maxRetriesPerRequest: 2,
      lazyConnect: false,
    });

    this.client.on('error', (err) => this.log.error({ err }, 'Redis lỗi'));
    this.client.on('connect', () => this.log.log('Redis đã nối'));
  }

  /** Kết nối RIÊNG. Bên đăng/nhận tin của socket cần connection của nó. */
  duplicate(): Redis {
    return this.client.duplicate();
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.client.del(...keys);
  }

  /** Dò sống chết cho `/health`. */
  async ping(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => this.client.disconnect());
  }
}
