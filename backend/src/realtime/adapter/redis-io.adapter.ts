import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Server, ServerOptions } from 'socket.io';
import { RedisService } from '../../infra/redis/service/index.js';

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

  /**
   * Bên đăng và bên nhận phải là hai kết nối RIÊNG — Redis khoá kết nối đang nghe.
   *
   * Phải ĐỢI nối xong: kết nối gốc tắt hàng đợi offline, nên `psubscribe` gọi
   * lúc chưa nối là ném "Stream isn't writeable" và server chết lúc bật — đã
   * xảy ra thật khi Redis nằm ở máy khác (Docker). Hai kết nối này thì BẬT hàng
   * đợi: Redis chập một nhịp thì tin socket chờ, không làm sập tiến trình.
   */
  async connectToRedis(redis: RedisService): Promise<void> {
    const options = { lazyConnect: true, enableOfflineQueue: true };
    const pub = redis.duplicate(options);
    const sub = redis.duplicate(options);
    await Promise.all([pub.connect(), sub.connect()]);
    this.adapter = createAdapter(pub, sub);
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;
    if (this.adapter) server.adapter(this.adapter);
    return server;
  }
}
