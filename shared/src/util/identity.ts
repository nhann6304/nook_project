/**
 * Soi qua đích đăng nhập — CHỈ để app biết nên hiện bàn phím nào và có nên cho
 * bấm nút hay chưa.
 *
 * Đây KHÔNG phải bộ kiểm thật. Bộ kiểm thật nằm ở backend, chỗ có
 * `libphonenumber-js` và biết đầu số nào có thật. Gói này không được có phụ
 * thuộc, nên ở đây chỉ soi được hình dạng.
 */

/** Có dấu @, có dấu chấm sau đó, không khoảng trắng. Chỉ vậy thôi. */
export function looksLikeEmail(value: string): boolean {
  const s = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

/** Chỉ số, có thể có dấu + đứng đầu, 8–15 chữ số. Chuẩn E.164 nhìn từ xa. */
export function looksLikePhone(value: string): boolean {
  const s = value.replace(/[\s().-]/g, '');
  return /^\+?\d{8,15}$/.test(s);
}

/** Bỏ mọi thứ không phải chữ số, giữ lại dấu + đứng đầu nếu có. */
export function stripPhone(value: string): string {
  const s = value.trim().replace(/[^\d+]/g, '');
  return s.startsWith('+') ? `+${s.slice(1).replace(/\+/g, '')}` : s.replace(/\+/g, '');
}
