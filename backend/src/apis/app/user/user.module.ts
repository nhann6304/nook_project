import { Module } from '@nestjs/common';
import { MediaModule } from '../media/index.js';
import { UserController } from './user.controller.js';
import { UserMapper } from './user.mapper.js';
import { UserService } from './user.service.js';
import { UsernameService } from './username.service.js';

/**
 * Người dùng — cửa cho app React Native. Hồ sơ của chính mình VÀ tên riêng.
 *
 * Tên riêng nằm cùng đây chứ không thành module riêng: nó là hai CỘT của bảng
 * `users` (`username` + `username_key`), `PATCH /v1/me` đặt nó, `/v1/username/
 * check` chỉ là cửa hỏi trước. Tách ra thì được một module chỉ để module kia
 * nhập vào, và người sửa hồ sơ phải mở hai thư mục.
 * Tệp thì vẫn tách: `username.service.ts` giữ luật ghi-thẳng-bắt-lỗi-trùng, nó
 * khác hẳn cách mấy trường kia hỏi-rồi-ghi.
 *
 * Không khai kho ở đây: kho nằm ở `src/repository/` và phát toàn cục, vì cả
 * app lẫn web quản trị đều hỏi cùng bảng `users`. Cũng không dùng
 * `TypeOrmModule.forFeature([...])` — nó tiêm một `Repository` neo cứng vào
 * kết nối gốc, chạy NGOÀI giao dịch mà không báo gì cả.
 */
@Module({
  // Đặt ảnh đại diện phải soi lại tấm ảnh: có thật, của mình, đã tải xong.
  imports: [MediaModule],
  controllers: [UserController],
  providers: [UserService, UserMapper, UsernameService],
  // Cửa đăng nhập cần `findOrCreateByIdentity` và `toProfile`.
  exports: [UserService, UserMapper],
})
export class UserModule {}
