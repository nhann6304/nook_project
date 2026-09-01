import type { CircleCapacity } from '../circle/circle.type.js';
import { STAT } from './achievement.constant.js';

export type StatKey = (typeof STAT)[keyof typeof STAT];

export const STAT_KEYS = Object.values(STAT) as readonly StatKey[];

/**
 * Một thành tích, nhìn từ phía một người dùng cụ thể.
 *
 * App KHÔNG viết cứng danh sách. Server trả về bao nhiêu thì vẽ bấy nhiêu.
 */
export interface AchievementItem {
  /** Khoá tra chữ, ví dụ 'circle.full_house' */
  key: string;
  /** Con đếm mà nó canh */
  metric: StatKey;
  /** Chạm tới đâu thì mở */
  threshold: number;
  /** Mở ra thì thêm mấy chỗ trong góc. Có thể là 0 — thành tích để ngắm */
  extraCircleSlots: number;
  /** Con đếm của người này, ngay lúc hỏi */
  value: number;
  /** ISO 8601, hoặc `null` nếu chưa mở */
  unlockedAt: string | null;
}

export interface AchievementListResult {
  circle: CircleCapacity;
  items: AchievementItem[];
}
