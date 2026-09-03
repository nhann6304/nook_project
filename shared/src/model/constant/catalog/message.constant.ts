import { COMMON_MSG } from '../../../common/constant/http/message.constant.js';
import { AUTH_MSG } from '../auth/auth-message.constant.js';
import { USER_MSG } from '../user/user-message.constant.js';

/**
 * Bảng gộp mọi mã thông báo — anh em song sinh với `ERR`.
 *
 * Mặc định của mọi cửa là `MSG.OK`. Chỉ đặt mã riêng khi app THẬT SỰ cần nói
 * một câu khác; đặt mã cho mọi cửa là tự đẻ ra một danh sách không ai dùng tới.
 */
export const MSG = {
  ...COMMON_MSG,
  ...AUTH_MSG,
  ...USER_MSG,
} as const;

/** Chốt trùng khoá — xem ghi chú ở `error.constant.ts`. */
type MsgKeyClash =
  | Extract<keyof typeof COMMON_MSG, keyof typeof AUTH_MSG>
  | Extract<keyof typeof COMMON_MSG, keyof typeof USER_MSG>
  | Extract<keyof typeof AUTH_MSG, keyof typeof USER_MSG>;

export const MSG_KEYS_ARE_UNIQUE: [MsgKeyClash] extends [never] ? true : never = true;
