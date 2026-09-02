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
 *
 * Vì sao chia theo khán giả chứ không theo bảng: hai bên hỏi cùng một bảng
 * `users` nhưng được thấy hai thứ khác nhau và làm được hai việc khác nhau.
 * Gộp chung một module rồi phân nhánh bằng `if (isAdmin)` là cách nhanh nhất
 * để một hôm nào đó app trả ra thứ chỉ quản trị mới được thấy.
 *
 * Cái GIỐNG nhau — câu truy vấn — nằm ở `src/repository/`, ngoài cả hai.
 * Cái KHÁC nhau — controller, dto, mapper — nằm trong thư mục của từng khán giả.
 *
 * Đăng nhập thì dùng chung: admin là một người dùng có vai khác, không phải một
 * hệ thống tài khoản thứ hai. Dựng hai hệ thống tài khoản là dựng hai chỗ để hở.
 */
@Module({
  imports: [HealthModule, AuthModule, AppApiModule, AdminModule],
})
export class ApisModule {}
