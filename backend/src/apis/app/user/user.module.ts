import { Module } from '@nestjs/common';
import { MediaModule } from '../media/index.js';
import { UsernameModule } from '../username/index.js';
import { UserController } from './user.controller.js';
import { UserMapper } from './user.mapper.js';
import { UserService } from './user.service.js';

/**
 * Hồ sơ của chính mình — cửa cho app React Native.
 *
 * Không khai kho ở đây: kho nằm ở `src/repository/` và phát toàn cục, vì cả
 * app lẫn web quản trị đều hỏi cùng bảng `users`. Cũng không dùng
 * `TypeOrmModule.forFeature([...])` — nó tiêm một `Repository` neo cứng vào
 * kết nối gốc, chạy NGOÀI giao dịch mà không báo gì cả.
 */
@Module({
  // Đặt ảnh đại diện phải soi lại tấm ảnh: có thật, của mình, đã tải xong.
  // Đặt tên riêng là việc của `username/`; ở đây chỉ mượn để `PATCH /v1/me` gọi.
  imports: [MediaModule, UsernameModule],
  controllers: [UserController],
  providers: [UserService, UserMapper],
  // Cửa đăng nhập cần `findOrCreateByIdentity` và `toProfile`.
  exports: [UserService, UserMapper],
})
export class UserModule {}
