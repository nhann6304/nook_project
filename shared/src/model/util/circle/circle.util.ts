import { CIRCLE_LIMITS, LEVEL_MEMORIES } from '../../constant/index.js';

/**
 * Số chỗ trong góc = chỗ ban đầu + chỗ mở được từ thành tích, chặn ở trần.
 * Hai bên cùng tính để app vẽ được "8/12" ngay mà không phải hỏi server.
 */
export function circleCapacity(extraSlots: number): number {
  return Math.min(CIRCLE_LIMITS.circleBase + Math.max(0, extraSlots), CIRCLE_LIMITS.circleMax);
}

/**
 * Số ký ức → cấp thân. Hàm thuần: hai bên chạy ra cùng một con số.
 *
 * App dùng để vẽ vòng quanh ảnh đại diện mà không phải chờ server. Server vẫn
 * là bên nói câu cuối cùng.
 */
export function levelFromMemories(memories: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_MEMORIES.length; i += 1) {
    if (memories >= (LEVEL_MEMORIES[i] ?? Infinity)) level = i + 1;
  }
  return level;
}

/** Còn thiếu bao nhiêu ký ức nữa thì lên cấp. `null` nghĩa là đã kịch cấp. */
export function memoriesToNextLevel(memories: number): number | null {
  const next = LEVEL_MEMORIES.find((need) => need > memories);
  return next === undefined ? null : next - memories;
}
