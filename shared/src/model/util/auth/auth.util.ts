import { SIGNIN_METHODS_ENABLED } from '../../constant/index.js';
import type { TEnabledSignInMethod, TSignInMethod } from '../../type/index.js';

export function isSignInMethodEnabled(method: TSignInMethod): method is TEnabledSignInMethod {
  return (SIGNIN_METHODS_ENABLED as readonly string[]).includes(method);
}

/**
 * Soi qua đích đăng nhập — CHỈ để app biết nên hiện bàn phím nào và có nên cho
 * bấm nút hay chưa. **Ba hàm dưới đây là của app, backend đừng gọi.**
 *
 * Đây KHÔNG phải bộ kiểm thật, và không thể là: gói này `dependencies` rỗng nên
 * nó không có `libphonenumber-js`, không biết đầu số nào có thật. Regex email ở
 * đây cho lọt `nam@b..com`, `nam@-.com`, `nam..h@gmail.com` — đủ để app biết
 * lúc nào sáng cái nút, không đủ để mở một tài khoản.
 *
 * Bộ kiểm thật nằm ở backend, dùng thư viện của backend: `isEmail` của
 * `class-validator` ở `auth.service.ts`, `parsePhoneNumberFromString` của
 * `libphonenumber-js` ở `normalizePhone`. Backend từng gọi `looksLikeEmail` làm
 * bộ kiểm cuối — chú thích ghi "bộ kiểm thật", mã thì chạy bộ kiểm lịch sự, và
 * hậu quả không lộ ra ngay: địa chỉ hỏng vẫn mở được tài khoản rồi thư không
 * tới nơi.
 */

/** Có dấu @, có dấu chấm sau đó, không khoảng trắng. Chỉ vậy thôi. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Chỉ số, có thể có dấu + đứng đầu, 8–15 chữ số. Chuẩn E.164 nhìn từ xa. */
export function looksLikePhone(value: string): boolean {
  return /^\+?\d{8,15}$/.test(value.replace(/[\s().-]/g, ''));
}

/** Bỏ mọi thứ không phải chữ số, giữ lại dấu + đứng đầu nếu có. */
export function stripPhone(value: string): string {
  const s = value.trim().replace(/[^\d+]/g, '');
  return s.startsWith('+') ? `+${s.slice(1).replace(/\+/g, '')}` : s.replace(/\+/g, '');
}
