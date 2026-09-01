import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { UserMapper } from './user.mapper.js';
import { UserRepository } from './user.repository.js';
import { UserIdentityRepository } from './user-identity.repository.js';
import { UserStatRepository } from './user-stat.repository.js';

/**
 * Không còn `TypeOrmModule.forFeature([...])` ở đây.
 *
 * Kho tự lấy `DataSource` rồi tự chọn `Repository` theo giao dịch đang chạy
 * (xem `BaseRepository`). Khai `forFeature` sẽ tiêm vào một `Repository` neo
 * cứng vào kết nối gốc — thứ chạy NGOÀI giao dịch mà không báo gì cả.
 */
@Module({
  controllers: [UserController],
  providers: [UserService, UserMapper, UserRepository, UserIdentityRepository, UserStatRepository],
  // Cửa đăng nhập cần `findOrCreateByIdentity`; thành tích cần con đếm.
  exports: [UserService, UserMapper, UserStatRepository],
})
export class UserModule {}
