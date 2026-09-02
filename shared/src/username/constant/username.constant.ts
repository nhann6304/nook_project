/**
 * Tên riêng (nickname) — **duy nhất trong cả hệ thống**.
 *
 * ── Hai cột, không phải một ─────────────────────────────────────────────────
 *
 *   username      đúng như người ta gõ, để HIỆN ra   -> "NamNguyen"
 *   username_key  dạng chuẩn, để SO SÁNH             -> "namnguyen"
 *
 * Chỉ cột thứ hai mang ràng buộc duy nhất. Nếu chỉ có một cột thì `Nam`, `nam`
 * và `NAM` là ba tên khác nhau — và người ta sẽ lấy tên của nhau bằng cách đổi
 * chữ hoa chữ thường, một trò cũ mà rất hiệu quả.
 */
export const USERNAME_LIMITS = {
  min: 3,
  max: 20,
} as const;

/**
 * Chỉ chữ thường, số, gạch dưới và dấu chấm — SAU khi chuẩn hoá.
 *
 * Không nhận chữ có dấu, không nhận emoji: `nam` và `nám` nhìn gần giống nhau
 * trên màn hình điện thoại, và đó đủ để mạo danh. Muốn hiện tên có dấu thì
 * dùng `displayName` — cột đó không cần duy nhất nên thoải mái.
 */
export const USERNAME_PATTERN = /^[a-z0-9._]+$/;

/**
 * Tên không ai được lấy.
 *
 * Hai nhóm: nghe như người của hệ thống (kẻ lừa đảo rất thích), và trùng với
 * đoạn đường dẫn — phòng khi sau này có `nook.app/<tên>`.
 */
export const RESERVED_USERNAMES = [
  'admin', 'administrator', 'root', 'system', 'nook', 'official', 'support',
  'help', 'staff', 'team', 'security', 'moderator', 'mod',
  'api', 'www', 'app', 'web', 'docs', 'about', 'terms', 'privacy',
  'me', 'you', 'settings', 'login', 'signup', 'signin', 'logout',
  'null', 'undefined', 'anonymous', 'deleted',
] as const;

export const USERNAME_ERR = {
  /** Đã có người lấy */
  USERNAME_TAKEN: 'username.taken',
  /** Sai dạng: quá ngắn, quá dài, hoặc có ký tự không nhận */
  USERNAME_INVALID: 'username.invalid',
  /** Nằm trong danh sách giữ chỗ */
  USERNAME_RESERVED: 'username.reserved',
} as const;
