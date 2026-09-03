import type { IAuthTokens } from '../../interface/index.js';
import type { SIGNIN_INTENTS, SIGNIN_METHODS, SIGNIN_METHODS_ENABLED } from '../../constant/index.js';

/** Người dùng chọn đăng nhập bằng gì. Suy ra từ danh sách, không gõ lại. */
export type TSignInMethod = (typeof SIGNIN_METHODS)[number];

/** Đường đang thật sự dùng được. Hiện chỉ có `'email'`. */
export type TEnabledSignInMethod = (typeof SIGNIN_METHODS_ENABLED)[number];

/** Người dùng bấm vào từ cửa nào. Suy ra từ danh sách, không gõ lại. */
export type TSignInIntent = (typeof SIGNIN_INTENTS)[number];

/** Làm mới thẻ trả về đúng bằng lúc phát thẻ. Đặt tên riêng cho Swagger dễ đọc. */
export type TRefreshResult = IAuthTokens;
