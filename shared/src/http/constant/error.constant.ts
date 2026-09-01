/**
 * Mã lỗi KHÔNG thuộc miền nào — hỏng ở tầng vận chuyển.
 *
 * Mã của từng miền nằm ở chính miền đó: `auth/auth.error.ts`,
 * `user/user.error.ts`, … Bảng gộp lại là `ERR` ở `catalog/`.
 */
export const COMMON_ERR = {
  BAD_REQUEST: 'common.bad_request',
  NOT_FOUND: 'common.not_found',
  RATE_LIMITED: 'common.rate_limited',
  SERVER_ERROR: 'common.server_error',
  /** Đường đã khai nhưng ruột chưa viết. Chỉ có ở giai đoạn dựng khung. */
  NOT_IMPLEMENTED: 'common.not_implemented',
} as const;
