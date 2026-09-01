import type { StatKey } from '../constant/achievement.js';

/**
 * Một thành tích, nhìn từ phía một người dùng cụ thể.
 *
 * App KHÔNG viết cứng danh sách. Server trả về bao nhiêu thì vẽ bấy nhiêu —
 * thêm thành tích mới là thêm một dòng trong bảng, app tự có.
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

/** Sức chứa của góc, đã cộng hết thành tích đã mở. */
export interface CircleCapacity {
  /** Chỗ ai cũng có */
  base: number;
  /** Chỗ kiếm thêm được */
  extra: number;
  /** Tổng đang dùng được (đã chặn ở trần) */
  capacity: number;
  /** Trần tuyệt đối */
  max: number;
  /** Đang có mấy người trong góc */
  used: number;
}

export interface AchievementListResult {
  circle: CircleCapacity;
  items: AchievementItem[];
}
