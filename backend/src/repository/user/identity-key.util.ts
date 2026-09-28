import type { TSignInMethod } from '@nook/shared';

/** Hai tên miền, một hộp thư. Google nhận cả hai, ta cũng phải coi là một. */
const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

/**
 * Rút một đích đăng nhập về DẠNG KHOÁ — cái quyết định "hai email này có phải
 * cùng một hộp thư không".
 *
 *   nam@gmail.com  ·  nam+947@gmail.com  ·  n.a.m@gmail.com   -> nam@gmail.com
 *
 * Khác với chuẩn hoá ở `AuthService.normalize`: chỗ đó lo cho người gõ hoa gõ
 * thường lung tung; chỗ này lo cho người CỐ Ý gõ khác đi. Không có nó thì một
 * hộp Gmail đẻ ra vô hạn tài khoản Nook, mỗi cái đều nhận được mã 6 số nên đều
 * "đã xác minh" hợp lệ — đúng hình dạng của công cụ nuôi tài khoản hàng loạt.
 *
 * **Bỏ dấu chấm CHỈ với Gmail.** Nhà cung cấp khác coi dấu chấm là ký tự có
 * nghĩa; gộp bừa là nhốt hai người thật vào chung một tài khoản — hỏng nặng
 * hơn nhiều so với để lọt vài tài khoản rác.
 *
 * ── Vì sao nằm ở `repository/`, không nằm ở service ────────────────────────
 *
 * Nó là ĐỊNH NGHĨA khoá duy nhất của bảng `user_identities`, không phải luật
 * của một khán giả nào — cả cửa app lẫn cửa quản trị đều phải dùng đúng một
 * cái. Đặt trong `apis/` thì `apis/admin/` không với tới được (`check:arch`
 * cấm, và cấm đúng). Đặt cạnh cái kho tự tính lấy nó thì không có đường nào
 * ghi vào bảng mà lệch khoá.
 */
export function identityKey(kind: TSignInMethod, value: string): string {
  const raw = value.trim().toLowerCase();
  if (kind !== 'email') return raw;

  const at = raw.lastIndexOf('@');
  if (at <= 0) return raw;

  const local = raw.slice(0, at);
  const domain = raw.slice(at + 1);

  // Nhãn sau dấu `+` do người dùng tự đặt, hộp thư không nhìn tới nó.
  const base = local.split('+')[0] || local;

  if (!GMAIL_DOMAINS.has(domain)) return `${base}@${domain}`;
  return `${base.replace(/\./g, '') || base}@gmail.com`;
}
