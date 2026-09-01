/**
 * Mã lỗi — backend CHỈ trả mã, không trả câu tiếng Việt.
 *
 * Câu chữ là việc của app (`frontend/src/i18n/locales/`). Server không biết
 * người dùng đang để máy ở tiếng nào, và không nên biết.
 *
 * Dạng mã: `<vùng>.<chuyện gì>`. Thêm mã mới thì thêm câu chữ ở cả hai kho
 * ngôn ngữ — nếu không, app rơi về câu chung chung.
 */
export const ERR = {
  // — đăng nhập —
  /** Mã 6 số không khớp */
  CODE_INVALID: 'auth.code_invalid',
  /** Mã đã quá hạn (xem LIMITS.codeTtlSeconds) */
  CODE_EXPIRED: 'auth.code_expired',
  /** Sai quá nhiều lần, mã này bị huỷ, phải xin mã khác */
  CODE_LOCKED: 'auth.code_locked',
  /** Xin mã quá dày, phải chờ */
  CODE_TOO_SOON: 'auth.code_too_soon',
  /** Xin mã quá nhiều trong một giờ */
  CODE_TOO_MANY: 'auth.code_too_many',
  /** Email hoặc số điện thoại không đúng dạng */
  TARGET_INVALID: 'auth.target_invalid',
  /** Không gửi được mã đi (nhà mạng / hộp thư từ chối) */
  SEND_FAILED: 'auth.send_failed',
  /** Đường đăng nhập này chưa mở — xem SIGNIN_METHODS_ENABLED */
  METHOD_UNAVAILABLE: 'auth.method_unavailable',

  // — phiên —
  /** Thẻ hết hạn */
  SESSION_EXPIRED: 'auth.session_expired',
  /** Thẻ đã bị thu hồi (đăng xuất, hoặc đăng nhập máy khác) */
  SESSION_REVOKED: 'auth.session_revoked',
  /** Không có thẻ, hoặc thẻ không đọc được */
  UNAUTHORIZED: 'auth.unauthorized',

  // — người dùng —
  USER_NOT_FOUND: 'user.not_found',
  /** Tên hiển thị rỗng, quá dài, hoặc toàn khoảng trắng */
  NAME_INVALID: 'user.name_invalid',

  // — góc bạn bè (chưa tới chặng này, để sẵn cho khỏi lệch) —
  CIRCLE_FULL: 'circle.full',
  ALREADY_FRIENDS: 'circle.already',

  // — chung —
  BAD_REQUEST: 'common.bad_request',
  NOT_FOUND: 'common.not_found',
  RATE_LIMITED: 'common.rate_limited',
  SERVER_ERROR: 'common.server_error',
  /** Đường đã khai nhưng ruột chưa viết. Chỉ có ở giai đoạn dựng khung. */
  NOT_IMPLEMENTED: 'common.not_implemented',
} as const;

export type ErrCode = (typeof ERR)[keyof typeof ERR];
