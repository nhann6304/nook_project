/**
 * Đường dẫn API — một nguồn duy nhất cho cả hai bên.
 *
 * Backend gắn thẳng vào decorator:  @Post(API.auth.code)
 * App gọi qua hàm `path`:           fetch(BASE + path(API.user.me))
 *
 * Vì chuỗi đã có sẵn `/v1`, backend KHÔNG đặt global prefix. Đổi đường dẫn ở
 * đây là cả hai bên đổi theo, không bên nào lệch được.
 */
export const API = {
  auth: {
    /** POST — xin mã 6 số về email hoặc số điện thoại */
    code: '/v1/auth/code',
    /** POST — nộp mã, đổi lấy thẻ phiên */
    verify: '/v1/auth/verify',
    /** POST — đổi thẻ dài hạn lấy thẻ ngắn hạn mới */
    refresh: '/v1/auth/refresh',
    /** POST — thu hồi thẻ dài hạn của chính phiên này */
    logout: '/v1/auth/logout',
  },
  user: {
    /** GET — hồ sơ của chính mình */
    me: '/v1/me',
    /** PATCH — sửa hồ sơ của chính mình */
    updateMe: '/v1/me',
  },
  admin: {
    /** GET — mấy con số cho trang thống kê trên web */
    stats: '/v1/admin/stats',
    /** GET — danh sách người dùng, lật trang bằng con trỏ */
    users: '/v1/admin/users',
  },
  achievement: {
    /** GET — thành tích của chính mình, kèm số chỗ trong góc */
    mine: '/v1/me/achievements',
  },
} as const;

/** Dò sống chết. Không nằm trong `/v1`, không cần thẻ. */
export const HEALTH_PATH = '/health';

/** Trang Swagger. Chỉ bật ở máy dev. */
export const DOCS_PATH = '/docs';
