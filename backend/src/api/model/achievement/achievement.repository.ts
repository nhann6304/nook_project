import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../../database/repository/base.repository.js';
import { Achievement } from '../../../database/entity/index.js';

/** Danh mục thành tích. Bảng tra, không phải bảng của người dùng. */
@Injectable()
export class AchievementRepository extends BaseRepository<Achievement> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, Achievement);
  }

  /** Những thành tích đang bật, theo thứ tự hiện ra ở app. */
  listActive(): Promise<Achievement[]> {
    return this.find({ where: { active: true }, order: { sort: 'ASC' } });
  }
}
