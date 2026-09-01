import { ApiProperty } from '@nestjs/swagger';
import {
  LIMITS,
  STAT_KEYS,
  type AchievementItem,
  type AchievementListResult,
  type CircleCapacity,
  type StatKey,
} from '@nook/shared';

export class AchievementItemDto implements AchievementItem {
  @ApiProperty({ example: 'circle.full_house', description: 'Khoá tra chữ ở app' })
  key!: string;

  @ApiProperty({ enum: STAT_KEYS, example: 'friend_count' })
  metric!: StatKey;

  @ApiProperty({ example: 10 })
  threshold!: number;

  @ApiProperty({ example: 2, description: 'Mở ra thì thêm mấy chỗ trong góc' })
  extraCircleSlots!: number;

  @ApiProperty({ example: 4, description: 'Con đếm của người này, ngay lúc hỏi' })
  value!: number;

  @ApiProperty({ format: 'date-time', nullable: true })
  unlockedAt!: string | null;
}

export class CircleCapacityDto implements CircleCapacity {
  @ApiProperty({ example: LIMITS.circleBase })
  base!: number;

  @ApiProperty({ example: 2 })
  extra!: number;

  @ApiProperty({ example: LIMITS.circleBase + 2 })
  capacity!: number;

  @ApiProperty({ example: LIMITS.circleMax })
  max!: number;

  @ApiProperty({ example: 4 })
  used!: number;
}

/**
 * Danh sách này do SERVER quyết, app không viết cứng.
 *
 * Thêm một thành tích mới = thêm một dòng trong bảng `achievements`. App tự có,
 * không phải ra bản mới. Đó là cả điểm của việc để danh mục trong bảng thay vì
 * trong mã.
 */
export class AchievementListDto implements AchievementListResult {
  @ApiProperty({ type: CircleCapacityDto })
  circle!: CircleCapacityDto;

  @ApiProperty({ type: [AchievementItemDto] })
  items!: AchievementItemDto[];
}
