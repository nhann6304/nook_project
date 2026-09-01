import { Injectable } from '@nestjs/common';
import { ERR, type ICursorPage } from '@nook/shared';
import { BaseCrudService } from '../../../../core/service/index.js';
import { CursorQueryDto } from '../../../../core/dto/index.js';
import { UserRepository } from '../../../../repository/index.js';
import { User } from '../../../../database/entity/index.js';
import { AdminUserMapper } from '../mapper/index.js';
import { AdminUserDto } from '../dto/index.js';

/**
 * Người dùng, nhìn từ trang quản trị.
 *
 * Kế thừa `BaseCrudService` nên đã có sẵn `page`, `findById`, `remove`… mà
 * không viết dòng nào. Đây đúng là ca mà lớp gốc đó sinh ra để phục vụ: một
 * module đọc-ghi bảng theo cách thông thường.
 *
 * Chưa mở `create`: mở tài khoản chỉ đi qua cửa đăng nhập bằng mã 6 số, không
 * có đường nào khác. Cần thì đè lại, nhưng phải cố ý.
 */
@Injectable()
export class AdminUserService extends BaseCrudService<User, AdminUserDto> {
  constructor(users: UserRepository, mapper: AdminUserMapper) {
    super(users, mapper);
  }

  protected override notFoundCode() {
    return ERR.USER_NOT_FOUND;
  }

  /** Một trang người dùng, mới nhất trước. */
  list(query: CursorQueryDto): Promise<ICursorPage<AdminUserDto>> {
    return this.page(query);
  }
}
