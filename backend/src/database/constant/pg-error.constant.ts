/**
 * Mã lỗi Postgres trả về ở `driverError.code`.
 *
 * Để ở backend chứ KHÔNG ở `@nook/shared`: gói đó là hợp đồng giữa app và
 * server, và nó bị nhét vào bản app trên điện thoại. App không có cơ sở dữ
 * liệu, nên mã lỗi của trình điều khiển không có việc gì ở đó.
 */
export const PG_ERR = {
  /** Đụng ràng buộc DUY NHẤT — thua cuộc đua ghi, không phải hỏng. */
  UNIQUE_VIOLATION: '23505',
  /** Trỏ tới một dòng không tồn tại. */
  FOREIGN_KEY_VIOLATION: '23503',
  /** Cột NOT NULL bị bỏ trống. */
  NOT_NULL_VIOLATION: '23502',
  /** Vi phạm CHECK. */
  CHECK_VIOLATION: '23514',
  /** Hai giao dịch khoá chéo nhau, Postgres cắt một bên. */
  DEADLOCK_DETECTED: '40P01',
  /** Chờ khoá quá lâu. */
  LOCK_NOT_AVAILABLE: '55P03',
} as const;
