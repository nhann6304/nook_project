import { AUTH_LIMITS } from '../auth/auth.constant.js';
import { USER_LIMITS } from '../user/user.constant.js';
import { CIRCLE_LIMITS } from '../circle/circle.constant.js';
import { MEMORY_LIMITS } from '../memory/memory.constant.js';
import { MEDIA_LIMITS } from '../media/media.constant.js';
import { USERNAME_LIMITS } from '../user/username.constant.js';

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
  ...MEDIA_LIMITS,
  ...USERNAME_LIMITS,
} as const;

/**
 * Chốt trùng khoá — xem ghi chú ở `error.constant.ts`.
 *
 * Chốt này cũng là lý do khoá phải mang tiền tố miền. `USERNAME_LIMITS` từng
 * là `{ min, max }` trần nên không gộp vào đây được — và vì không gộp được nên
 * nó lặng lẽ đứng ngoài bảng `LIMITS` một thời gian, đúng cái mà bảng gộp sinh
 * ra để tránh. Giờ là `usernameMin` / `usernameMax`.
 */
type LimitKeyClash =
  | Extract<keyof typeof AUTH_LIMITS, keyof typeof USER_LIMITS>
  | Extract<keyof typeof AUTH_LIMITS, keyof typeof CIRCLE_LIMITS>
  | Extract<keyof typeof AUTH_LIMITS, keyof typeof MEMORY_LIMITS>
  | Extract<keyof typeof AUTH_LIMITS, keyof typeof MEDIA_LIMITS>
  | Extract<keyof typeof AUTH_LIMITS, keyof typeof USERNAME_LIMITS>
  | Extract<keyof typeof USER_LIMITS, keyof typeof CIRCLE_LIMITS>
  | Extract<keyof typeof USER_LIMITS, keyof typeof MEMORY_LIMITS>
  | Extract<keyof typeof USER_LIMITS, keyof typeof MEDIA_LIMITS>
  | Extract<keyof typeof USER_LIMITS, keyof typeof USERNAME_LIMITS>
  | Extract<keyof typeof CIRCLE_LIMITS, keyof typeof MEMORY_LIMITS>
  | Extract<keyof typeof CIRCLE_LIMITS, keyof typeof MEDIA_LIMITS>
  | Extract<keyof typeof CIRCLE_LIMITS, keyof typeof USERNAME_LIMITS>
  | Extract<keyof typeof MEMORY_LIMITS, keyof typeof MEDIA_LIMITS>
  | Extract<keyof typeof MEMORY_LIMITS, keyof typeof USERNAME_LIMITS>
  | Extract<keyof typeof MEDIA_LIMITS, keyof typeof USERNAME_LIMITS>;

export const LIMIT_KEYS_ARE_UNIQUE: [LimitKeyClash] extends [never] ? true : never = true;
