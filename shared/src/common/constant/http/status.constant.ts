/**
 * Mã HTTP mà server này thật sự dùng.
 *
 * Cố tình KHÔNG chép cả bảng chuẩn vào đây. Một danh sách 60 mã mà chỉ dùng 12
 * cái thì không nói lên điều gì; danh sách này nói: đây là toàn bộ những gì
 * server trả về, gặp mã ngoài bảng là có chuyện.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  /** Thứ từng có nhưng đã hết hạn — mã đăng nhập quá 5 phút chẳng hạn. */
  GONE: 410,
  TOO_MANY_REQUESTS: 429,

  SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  /** Server phụ thuộc vào một bên ngoài, và bên đó hỏng (hộp thư, nhà mạng). */
  BAD_GATEWAY: 502,
} as const;
