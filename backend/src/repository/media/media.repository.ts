import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, LessThan } from 'typeorm';
import { BaseRepository } from '../../core/repository/index.js';
import { Media } from '../../database/entity/index.js';

@Injectable()
export class MediaRepository extends BaseRepository<Media> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, Media);
  }

  /** Ảnh của một người, mới nhất trước. */
  listByOwner(ownerId: string): Promise<Media[]> {
    return this.find({ where: { ownerId }, order: { createdAt: 'DESC' } });
  }

  /**
   * Mấy dòng xin đường tải lên rồi bỏ giữa chừng.
   *
   * Có thật và không tránh được: app xin đường xong thì mất mạng, hoặc người
   * dùng đổi ý. Việc nền (chặng sau) quét đống này rồi dọn — nhưng chỉ dọn
   * dòng `pending`, **không bao giờ đụng vào dòng `ready`**.
   */
  listStalePending(before: Date): Promise<Media[]> {
    return this.find({ where: { status: 'pending', createdAt: LessThan(before) } });
  }
}
