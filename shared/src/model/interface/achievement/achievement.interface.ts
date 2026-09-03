import type { TStatKey } from '../../type/index.js';
import type { ICircleCapacity } from '../circle/circle.interface.js';
/**
 * Một thành tích, nhìn từ phía một người dùng cụ thể.
 *
 * App KHÔNG viết cứng danh sách. Server trả về bao nhiêu thì vẽ bấy nhiêu.
 */
export interface IAchievementItem {
  /** Khoá tra chữ, ví dụ 'circle.full_house' */
  key: string;
  /** Con đếm mà nó canh */
  metric: TStatKey;
  /** Chạm tới đâu thì mở */
  threshold: number;
  /** Mở ra thì thêm mấy chỗ trong góc. Có thể là 0 — thành tích để ngắm */
  extraCircleSlots: number;
  /** Con đếm của người này, ngay lúc hỏi */
  value: number;
  /** ISO 8601, hoặc `null` nếu chưa mở */
  unlockedAt: string | null;
}

export interface IAchievementListResult {
  circle: ICircleCapacity;
  items: IAchievementItem[];
}
