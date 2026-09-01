import type { ERR } from '../constant/index.js';

/** Mọi mã lỗi mà server có thể trả về. Suy ra từ bảng gộp, không gõ lại. */
export type TErrCode = (typeof ERR)[keyof typeof ERR];
