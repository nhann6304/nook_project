import { LEVEL_MEMORIES } from '../constant/level.js';

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
