import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull, LessThan } from 'typeorm';
import { BaseRepository } from '../../core/repository/index.js';
import { Session } from '../../database/entity/index.js';

@Injectable()
export class SessionRepository extends BaseRepository<Session> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, Session);
  }

  /** Chỉ ba cột. Cổng thẻ hỏi câu này ở MỖI request — đừng kéo cả dòng lên. */
  findForGate(id: string): Promise<Session | null> {
    return this.findOne({ id }, { select: { id: true, revokedAt: true, expiresAt: true } });
  }

  /**
   * Lấy phiên và **KHOÁ DÒNG** lại cho tới hết giao dịch.
   *
   * `FOR UPDATE` là chỗ sửa lỗi thật: không có nó thì hai lượt làm mới cùng lúc
   * cùng ĐỌC dấu vân cũ trước khi ai kịp GHI, nên cả hai cùng thấy khớp và cả
   * hai cùng xoay. Bẫy "thẻ bị chép" không nổ trong đúng cái ca nó sinh ra để
   * bắt, và chỉ một trong hai thẻ mới là thẻ thật.
   *
   * Khoá rồi thì lượt sau phải ĐỢI, và khi vào được thì nó đọc dấu vân MỚI —
   * lúc đó mới quyết định được đúng.
   */
  findForRotate(id: string): Promise<Session | null> {
    return this.repo
      .createQueryBuilder('s')
      .setLock('pessimistic_write')
      .where('s.id = :id', { id })
      .getOne();
  }

  /** Thu hồi một phiên. Không xoá dòng — còn để lại dấu ai đăng nhập ở đâu, lúc nào. */
  revoke(id: string): Promise<number> {
    return this.update({ id, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  /**
   * Thu HẾT phiên của một người.
   *
   * Dùng khi thấy thẻ dài hạn bị dùng lại — dấu hiệu thẻ đã bị chép đi. Lúc đó
   * không biết máy nào là của chủ, nên đá hết rồi để họ đăng nhập lại.
   */
  revokeAllOf(userId: string): Promise<number> {
    return this.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  /** Dọn phiên đã chết hẳn. Việc nền, chặng sau. */
  deleteExpiredBefore(cutoff: Date): Promise<number> {
    return this.delete({ expiresAt: LessThan(cutoff) });
  }
}
