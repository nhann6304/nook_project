import { COMMON_ERR } from '../../http/constant/error.constant.js';
import { AUTH_ERR } from '../../auth/constant/auth-error.constant.js';
import { USER_ERR } from '../../user/constant/user-error.constant.js';
import { CIRCLE_ERR } from '../../circle/constant/circle-error.constant.js';

/**
 * Bảng gộp mọi mã lỗi.
 *
 * Mã SỐNG ở miền của nó (`auth/auth.error.ts`, `user/user.error.ts`, …). Chỗ
 * này chỉ ghép lại để hai bên có một bảng duy nhất mà tra, và để cái kiểu
 * `TErrCode` bao được hết.
 *
 * Vì sao tách rồi lại gộp: ngày nào `circle` tách ra thành gói riêng thì nó
 * mang theo mã của nó, không phải đi bóc từng dòng ra khỏi một tệp chung.
 *
 * Trùng tên khoá thì miền sau ĐÈ miền trước, im lặng — nên có chốt biên dịch ở
 * cuối tệp. Vì vậy khoá của từng miền mang sẵn tiền tố (`USER_NOT_FOUND`,
 * `CIRCLE_FULL`) chứ không phải tên trần.
 */
export const ERR = {
  ...COMMON_ERR,
  ...AUTH_ERR,
  ...USER_ERR,
  ...CIRCLE_ERR,
} as const;

/**
 * Chốt biên dịch: hai bảng đặt trùng tên khoá thì dòng cuối đỏ ngay.
 *
 * Không có nó thì trùng khoá là một cú đè im lặng — mã bị đè vẫn còn trong
 * nguồn, vẫn đọc thấy, nhưng `ERR.X` trả về giá trị của miền kia. Đúng loại lỗi
 * ngồi soi bằng mắt không ra.
 */
type ErrKeyClash =
  | Extract<keyof typeof COMMON_ERR, keyof typeof AUTH_ERR>
  | Extract<keyof typeof COMMON_ERR, keyof typeof USER_ERR>
  | Extract<keyof typeof COMMON_ERR, keyof typeof CIRCLE_ERR>
  | Extract<keyof typeof AUTH_ERR, keyof typeof USER_ERR>
  | Extract<keyof typeof AUTH_ERR, keyof typeof CIRCLE_ERR>
  | Extract<keyof typeof USER_ERR, keyof typeof CIRCLE_ERR>;

export const ERR_KEYS_ARE_UNIQUE: [ErrKeyClash] extends [never] ? true : never = true;
