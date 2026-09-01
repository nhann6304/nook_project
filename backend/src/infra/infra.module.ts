import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module.js';
import { NotifyModule } from './notify/notify.module.js';

/**
 * Thế giới bên ngoài: Redis, đường gửi thư, và sau này là kho ảnh (R2/MinIO)
 * cùng thông báo đẩy.
 *
 * Mỗi thứ một thư mục, mỗi thư mục một module. Không đổ chung vào một chỗ rồi
 * gọi nó là "utils" — ba tháng nữa không ai biết cái gì phụ thuộc vào cái gì.
 */
@Module({
  imports: [RedisModule, NotifyModule],
  exports: [RedisModule, NotifyModule],
})
export class InfraModule {}
