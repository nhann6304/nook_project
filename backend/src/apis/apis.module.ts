import { Module } from '@nestjs/common';
import { AuthModule } from './auth/index.js';
import { HealthModule } from './health/index.js';
import { AppApiModule } from './app/index.js';
import { AdminModule } from './admin/index.js';

/**
 * Mặt API, chia theo **KHÁN GIẢ**.
 *
 *   auth/   đăng nhập — CẢ HAI khán giả cùng đi qua đây
 *   app/    app React Native  → /v1/...
 *   admin/  web quản trị      → /v1/admin/...  (đều `@Roles`)
 *   health/ dò sống chết
 * Cái GIỐNG nhau — câu truy vấn — nằm ở `src/repository/`, ngoài cả hai.
 * Cái KHÁC nhau — controller, dto, mapper — nằm trong thư mục của từng khán giả.
 *
 * Đăng nhập thì dùng chung: admin là một người dùng có vai khác, không phải một
 * hệ thống tài khoản thứ hai. Dựng hai hệ thống tài khoản là dựng hai chỗ để hở.
 */
@Module({
  imports: [HealthModule, AuthModule, AppApiModule, AdminModule],
})
export class ApisModule { }
