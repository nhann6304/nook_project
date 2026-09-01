import type { HTTP_STATUS } from '../constant/index.js';

/** Suy ra từ bảng `HTTP_STATUS` — thêm một mã ở đó là kiểu này rộng ra theo. */
export type THttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
