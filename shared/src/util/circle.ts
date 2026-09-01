import { LIMITS } from '../constant/limit.js';

/**
 * Số chỗ trong góc = chỗ ban đầu + chỗ mở được từ thành tích, chặn ở trần.
 *
 * Hai bên cùng tính để app vẽ được "8/12" ngay mà không phải hỏi server.
 */
export function circleCapacity(extraSlots: number): number {
  return Math.min(LIMITS.circleBase + Math.max(0, extraSlots), LIMITS.circleMax);
}
