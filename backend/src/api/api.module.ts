import { Module } from '@nestjs/common';
import { AuthModule } from './common/auth/auth.module.js';
import { HealthModule } from './common/health/health.module.js';
import { UserModule } from './model/user/user.module.js';
import { AchievementModule } from './model/achievement/achievement.module.js';

/**
 * Mặt API, gom một chỗ.
 *
 *   common/  thứ mọi cửa đều dùng — cổng thẻ, bộ lọc lỗi, bộ kiểm đầu vào,
 *            decorator, và cả phần đăng nhập (nó không phải một "mô hình dữ
 *            liệu", nó là cái cửa ai cũng phải qua).
 *   model/   một thư mục cho một thứ có thật trong sản phẩm. Mỗi thư mục là
 *            một module đủ bộ: controller, service, dto/ — không đổ chung.
 *
 * Chặng sau thêm vào đây: circle · moment · thread · media · memory · push.
 */
@Module({
  imports: [HealthModule, AuthModule, UserModule, AchievementModule],
})
export class ApiModule {}
