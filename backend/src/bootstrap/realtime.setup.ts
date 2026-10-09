import type { INestApplication } from '@nestjs/common';
import { RedisIoAdapter } from '../realtime/index.js';
import { RedisService } from '../infra/redis/index.js';

/**
 * Cầu Redis cho ống socket.
 *
 * Một bản server thì thừa. Hai bản trở lên thì THIẾU nó là tin chỉ tới được
 * những ai tình cờ nối đúng bản đang phát. Dựng sẵn từ bây giờ vì thêm sau là
 * phải sửa cả cách khởi động — và lúc đó là lúc đang có người dùng thật.
 */
export async function setupRealtime(app: INestApplication): Promise<void> {
  const adapter = new RedisIoAdapter(app);
  await adapter.connectToRedis(app.get(RedisService));
  app.useWebSocketAdapter(adapter);
}
