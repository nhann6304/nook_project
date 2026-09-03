/**
 * Vai của một người trong hệ thống.
 *
 * KHÔNG phải "hạng" của sản phẩm — Nook cấm chữ *hạng* trong chữ hiện cho
 * người dùng, và vai này không bao giờ hiện ra ở app. Nó chỉ trả lời một câu:
 * người này có được vào trang quản trị hay không.
 *
 *   member  người dùng bình thường. Mặc định.
 *   admin   vào được các cửa quản trị.
 *   root    như admin, và là người duy nhất phong/hạ được admin khác.
 *
 * Hai vai chứ không phải một cờ `isAdmin`, vì `root` phải là thứ không ai tự
 * phong cho mình được — kể cả admin.
 */
export const USER_ROLES = ['member', 'admin', 'root'] as const;

export const ROLE = {
  member: 'member',
  admin: 'admin',
  root: 'root',
} as const;

/** Vai vào được cửa quản trị. */
export const ADMIN_ROLES = ['admin', 'root'] as const;

export const USER_LIMITS = {
  /** Tên hiển thị, tính sau khi cắt khoảng trắng hai đầu */
  displayNameMin: 1,
  displayNameMax: 24,
} as const;
