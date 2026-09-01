/**
 * Thành tích — thứ mở thêm chỗ trong góc bạn bè.
 *
 * Cách nó chạy, gọn trong một câu: mỗi thành tích canh MỘT con đếm
 * (`StatKey`); con đếm chạm ngưỡng thì thành tích mở, và mở kèm theo mấy chỗ
 * trong góc.
 *
 * Thêm thành tích mới = THÊM MỘT DÒNG trong bảng `achievements`, không sửa
 * dòng mã nào. Đó là chỗ để mở rộng sau này.
 *
 * Backend trả về KHOÁ (`circle.full_house`), app tra ra câu chữ. Ba từ cấm
 * trong chữ hiện cho người dùng vẫn giữ nguyên: *điểm*, *hạng*, *nhiệm vụ*.
 */

/** Những con đếm mà thành tích canh chừng. */
export const STAT = {
  /** Số người đang ở trong góc */
  friendCount: 'friend_count',
  /** Số khoảnh khắc đã đăng */
  momentCount: 'moment_count',
  /** Tổng ký ức cộng lại từ mọi cặp bạn */
  memoryTotal: 'memory_total',
  /** Chuỗi ngày liền nhau có ít nhất một ký ức */
  dayStreak: 'day_streak',
} as const;

export type StatKey = (typeof STAT)[keyof typeof STAT];

export const STAT_KEYS = Object.values(STAT) as readonly StatKey[];
