import { Injectable } from '@nestjs/common';
import { LIMITS, circleCapacity, type TStatKey } from '@nook/shared';
import { Achievement, UserStat } from '../../../../database/entity/index.js';
import { AchievementItemDto, CircleCapacityDto } from '../dto/index.js';

/** Tên cột trong bảng đếm, tra theo tên con đếm bên `@nook/shared`. */
const COLUMN: Record<TStatKey, keyof UserStat> = {
  friend_count: 'friendCount',
  moment_count: 'momentCount',
  memory_total: 'memoryTotal',
  day_streak: 'dayStreak',
};

/**
 * Bộ nắn này KHÔNG kế thừa `BaseMapper`, và đó là chủ ý.
 *
 * `BaseMapper` nắn MỘT bảng thành một thứ. Ở đây đầu vào là một CẶP: dòng danh
 * mục cộng với trạng thái của người đang hỏi. Nhét cho vừa lớp gốc bằng cách
 * thêm tham số tuỳ chọn sẽ làm lớp gốc lỏng đi cho mọi bộ nắn khác — đắt hơn
 * là để một trường hợp đứng riêng.
 */
@Injectable()
export class AchievementMapper {
  toItem(
    row: Achievement,
    state: { stat: UserStat | null; unlockedAt: Map<string, Date> },
  ): AchievementItemDto {
    const value = state.stat ? Number(state.stat[COLUMN[row.metric]] ?? 0) : 0;
    return {
      key: row.key,
      metric: row.metric,
      threshold: row.threshold,
      extraCircleSlots: row.extraCircleSlots,
      value,
      unlockedAt: state.unlockedAt.get(row.key)?.toISOString() ?? null,
    };
  }

  toItemList(
    rows: Achievement[],
    state: { stat: UserStat | null; unlockedAt: Map<string, Date> },
  ): AchievementItemDto[] {
    return rows.map((row) => this.toItem(row, state));
  }

  toCircle(stat: UserStat | null): CircleCapacityDto {
    const extra = stat?.extraCircleSlots ?? 0;
    return {
      base: LIMITS.circleBase,
      extra,
      capacity: circleCapacity(extra),
      max: LIMITS.circleMax,
      used: stat?.friendCount ?? 0,
    };
  }
}
