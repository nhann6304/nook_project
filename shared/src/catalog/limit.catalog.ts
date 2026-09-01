import { AUTH_LIMITS } from '../auth/auth.constant.js';
import { USER_LIMITS } from '../user/user.constant.js';
import { CIRCLE_LIMITS } from '../circle/circle.constant.js';
import { MEMORY_LIMITS } from '../memory/memory.constant.js';

/**
 * Bảng gộp mọi giới hạn.
 *
 * App dùng để chặn trước cho đỡ phí một vòng mạng; server dùng làm luật thật.
 * App chặn là để lịch sự, server chặn mới là chặn.
 */
export const LIMITS = {
  ...AUTH_LIMITS,
  ...USER_LIMITS,
  ...CIRCLE_LIMITS,
  ...MEMORY_LIMITS,
} as const;

/** Chốt trùng khoá — xem ghi chú ở `error.catalog.ts`. */
type LimitKeyClash =
  | Extract<keyof typeof AUTH_LIMITS, keyof typeof USER_LIMITS>
  | Extract<keyof typeof AUTH_LIMITS, keyof typeof CIRCLE_LIMITS>
  | Extract<keyof typeof AUTH_LIMITS, keyof typeof MEMORY_LIMITS>
  | Extract<keyof typeof USER_LIMITS, keyof typeof CIRCLE_LIMITS>
  | Extract<keyof typeof USER_LIMITS, keyof typeof MEMORY_LIMITS>
  | Extract<keyof typeof CIRCLE_LIMITS, keyof typeof MEMORY_LIMITS>;

export const LIMIT_KEYS_ARE_UNIQUE: [LimitKeyClash] extends [never] ? true : never = true;
