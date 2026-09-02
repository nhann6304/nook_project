import { Module } from '@nestjs/common';
import { UserController, UsernameController } from './controller/index.js';
import { UserService, UsernameService } from './service/index.js';
import { UserMapper } from './mapper/index.js';
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
