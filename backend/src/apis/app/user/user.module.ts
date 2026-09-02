import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UsernameController } from './username.controller.js';;
import { UserService } from './user.service.js';
import { UsernameService } from './username.service.js';;
import { UserMapper } from './user.mapper.js';
import { MediaModule } from '../media/index.js';

/**
 * Hồ sơ của chính mình — cửa cho **app React Native**.
 *
 * Không khai kho ở đây: kho nằm ở `src/repository/` và được phát toàn cục, vì
 * cả app lẫn web quản trị đều hỏi cùng bảng `users`.
 *
 * Cũng không có `TypeOrmModule.forFeature([...])`: nó tiêm vào một `Repository`
 * neo cứng vào kết nối gốc, thứ chạy NGOÀI giao dịch mà không báo gì cả.
 */
@Module({
  // Đặt ảnh đại diện phải soi lại tấm ảnh: có thật, của mình, đã tải xong.
  imports: [MediaModule],
  controllers: [UserController, UsernameController],
  providers: [UserService, UsernameService, UserMapper],
  // Cửa đăng nhập cần `findOrCreateByIdentity` và `toProfile`.
  exports: [UserService, UsernameService, UserMapper],
})
export class UserModule {}
