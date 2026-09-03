export const AUTH_ERR = {
  // — mã 6 số —
  /** Mã không khớp */
  CODE_INVALID: 'auth.code_invalid',
  /** Mã đã quá hạn (xem AUTH_LIMITS.codeTtlSeconds) */
  CODE_EXPIRED: 'auth.code_expired',
  /** Sai quá nhiều lần, mã này bị huỷ, phải xin mã khác */
  CODE_LOCKED: 'auth.code_locked',
  /** Xin mã quá dày, phải chờ */
  CODE_TOO_SOON: 'auth.code_too_soon',
  /** Xin mã quá nhiều trong một giờ, tính theo email */
  CODE_TOO_MANY: 'auth.code_too_many',
  /** Xin mã quá nhiều trong một giờ, tính theo máy gọi */
  CODE_TOO_MANY_HERE: 'auth.code_too_many_here',
  /** Email hoặc số điện thoại không đúng dạng */
  TARGET_INVALID: 'auth.target_invalid',
  /** Không gửi được mã đi (nhà mạng / hộp thư từ chối) */
  SEND_FAILED: 'auth.send_failed',
  /** Đường đăng nhập này chưa mở — xem SIGNIN_METHODS_ENABLED */
  METHOD_UNAVAILABLE: 'auth.method_unavailable',

  // — hai cửa vào —
  /** Vào từ cửa "đã có tài khoản", nhưng email này chưa ai dùng */
  ACCOUNT_NOT_FOUND: 'auth.account_not_found',
  /** Vào từ cửa "tạo tài khoản", nhưng email này đã có tài khoản rồi */
  ACCOUNT_EXISTS: 'auth.account_exists',

  // — phiên —
  /** Thẻ hết hạn */
  SESSION_EXPIRED: 'auth.session_expired',
  /** Thẻ đã bị thu hồi (đăng xuất, hoặc thẻ bị chép nên thu hết) */
  SESSION_REVOKED: 'auth.session_revoked',
  /** Không có thẻ, hoặc thẻ không đọc được */
  UNAUTHORIZED: 'auth.unauthorized',
  /** Có thẻ, thẻ đúng, nhưng không đủ quyền cho cửa này */
  FORBIDDEN: 'auth.forbidden',
} as const;
