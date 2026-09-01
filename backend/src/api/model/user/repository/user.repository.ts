import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';
import { BaseRepository } from '../../../../database/repository/index.js';
import { User } from '../../../../database/entity/index.js';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, User);
  }

  /** Người còn sống. Ai đã tự xoá tài khoản thì coi như không tồn tại. */
  findAlive(id: string): Promise<User | null> {
    return this.findOne({ id, deletedAt: IsNull() });
  }

  /** Chấm giờ ghé thăm. Dùng `update` vì chỉ đụng một cột, không cần đọc lên. */
  touchLastSeen(id: string): Promise<number> {
    return this.update({ id }, { lastSeenAt: new Date() });
  }
}
