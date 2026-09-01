import { Module } from '@nestjs/common';
import { UserController } from './controller/index.js';
import { UserService } from './service/index.js';
import { UserMapper } from './mapper/index.js';
import { UserRepository, UserIdentityRepository, UserStatRepository } from './repository/index.js';

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
