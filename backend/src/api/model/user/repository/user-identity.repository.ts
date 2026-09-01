import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { SignInMethod } from '@nook/shared';
import { BaseRepository } from '../../../../database/repository/index.js';
import { UserIdentity } from '../../../../database/entity/index.js';

@Injectable()
export class UserIdentityRepository extends BaseRepository<UserIdentity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, UserIdentity);
  }

  /**
   * Đích đăng nhập. `value` phải đã chuẩn hoá.
   *
   * Trả về **đúng dòng này**, không kéo theo người sở hữu. Không có quan hệ ORM
   * ở dự án này — ai cần người sở hữu thì hỏi kho người dùng bằng `userId`. Một
   * câu hỏi nữa, nhưng là câu hỏi nhìn thấy được, và không có chuyện phần nối
   * bảng tự lọc mất dòng rồi làm ngã một nhánh đang đúng.
   */
  findByTarget(kind: SignInMethod, value: string): Promise<UserIdentity | null> {
    return this.findOne({ kind, value });
  }

  /**
   * Chèn, và **nhường** nếu có người chèn trước.
   *
   * `ON CONFLICT DO NOTHING` là chỗ chặn thật cho cuộc đua "hai máy cùng nộp
   * mã cho một email". Đọc-rồi-mới-ghi không chặn được: giữa lúc đọc và lúc ghi
   * vẫn có khe. Ràng buộc UNIQUE của cơ sở dữ liệu là thứ duy nhất không có khe.
   *
   * Trả `null` nghĩa là mình thua cuộc đua — bên gọi phải đọc lại.
   *
   * Viết SQL thô chứ không qua TypeORM: `ON CONFLICT … RETURNING` không có
   * trong bộ dựng câu của nó, và viết vòng vèo để né thì khó đọc hơn là viết thẳng.
   */
  async insertIfAbsent(
    userId: string,
    kind: SignInMethod,
    value: string,
  ): Promise<UserIdentity | null> {
    const rows: { id: string }[] = await this.manager.query(
      `INSERT INTO "user_identities" ("user_id", "kind", "value", "verified_at")
       VALUES ($1, $2, $3, now())
       ON CONFLICT ("kind", "value") DO NOTHING
       RETURNING "id"`,
      [userId, kind, value],
    );

    const id = rows[0]?.id;
    return id ? this.findById(id) : null;
  }

  /** Chấm dấu "vừa nhập đúng mã gửi tới đích này". */
  markVerified(id: string): Promise<number> {
    return this.update({ id }, { verifiedAt: new Date() });
  }
}
