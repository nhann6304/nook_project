import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { BaseRepository } from '../../core/repository/index.js';
import type { TMediaVariant } from '@nook/shared';
import { MediaVariant } from '../../database/entity/index.js';

@Injectable()
export class MediaVariantRepository extends BaseRepository<MediaVariant> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, MediaVariant);
  }

  /** Mấy bản nhẹ ĐÃ dựng xong của một tấm. */
  readyOf(mediaId: string): Promise<MediaVariant[]> {
    return this.find({ where: { mediaId, status: 'ready' } });
  }

  /** Cho nhiều tấm cùng lúc — bảng tin hỏi hàng chục tấm một lần. */
  readyOfMany(mediaIds: string[]): Promise<MediaVariant[]> {
    if (mediaIds.length === 0) return Promise.resolve([]);
    return this.find({ where: { mediaId: In(mediaIds), status: 'ready' } });
  }

  findOneOf(mediaId: string, variant: TMediaVariant): Promise<MediaVariant | null> {
    return this.findOne({ mediaId, variant });
  }
}
