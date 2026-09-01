import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../../database/repository/base.repository.js';
import { UserStat } from '../../../database/entity/index.js';

/**
 * Con đếm của người dùng.
 *
 * Kho này ở module `user` chứ không ở `achievement`, dù thành tích là bên đọc
 * nó nhiều nhất — vì bảng này thuộc về người dùng, và dòng của nó được tạo
 * cùng lúc với tài khoản. Đặt theo chỗ dữ liệu THUỘC VỀ, không theo chỗ dữ
 * liệu được đọc.
 */
@Injectable()
export class UserStatRepository extends BaseRepository<UserStat> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, UserStat);
  }

  findByUser(userId: string): Promise<UserStat | null> {
    return this.findOne({ userId });
  }

  /**
   * Cộng thẳng vào con đếm bằng SQL, không đọc lên rồi ghi xuống.
   *
   * Đọc-cộng-ghi trong hai luồng song song thì một lần cộng biến mất, im lặng.
   * `column = column + $n` để chính cơ sở dữ liệu cộng, và nó khoá dòng trong
   * lúc cộng.
   */
  async bump(userId: string, column: 'friend_count' | 'moment_count' | 'memory_total', by: number): Promise<void> {
    await this.manager.query(
      `UPDATE "user_stats" SET "${column}" = "${column}" + $2, "updated_at" = now() WHERE "user_id" = $1`,
      [userId, by],
    );
  }
}
