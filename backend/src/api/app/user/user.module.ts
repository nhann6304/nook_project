import { Module } from '@nestjs/common';
import { UserController } from './controller/index.js';
import { UserService } from './service/index.js';
import { UserMapper } from './mapper/index.js';

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
  controllers: [UserController],
  providers: [UserService, UserMapper],
  // Cửa đăng nhập cần `findOrCreateByIdentity` và `toProfile`.
  exports: [UserService, UserMapper],
})
export class UserModule {}
