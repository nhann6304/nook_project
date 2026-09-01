import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Server, ServerOptions } from 'socket.io';
import { RedisService } from '../infra/redis/redis.service.js';

/**
 * Cầu nối Redis cho socket.
 *
 * Một bản server thì không cần. Hai bản trở lên thì CẦN: người A nối vào bản 1,
 * người B nối vào bản 2, và bản 1 phải bắn được tin tới B. Không có cầu này
 * thì tin chỉ tới được những ai tình cờ nối đúng bản đang phát.
 *
 * Dựng sẵn từ bây giờ vì thêm sau là phải sửa cả cách khởi động — và lúc đó là
 * lúc đang có người dùng thật.
 */
export class RedisIoAdapter extends IoAdapter {
  private adapter?: ReturnType<typeof createAdapter>;

  constructor(app: INestApplicationContext) {
    super(app);
  }

  /** Bên đăng và bên nhận phải là hai kết nối RIÊNG — Redis khoá kết nối đang nghe. */
  connectToRedis(redis: RedisService): void {
    this.adapter = createAdapter(redis.duplicate(), redis.duplicate());
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;
    if (this.adapter) server.adapter(this.adapter);
    return server;
  }
}
