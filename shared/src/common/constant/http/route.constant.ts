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
    /** POST — nộp mã, đổi lấy thẻ phiên (đăng nhập bằng mã — đường cũ, vẫn giữ) */
    verify: '/v1/auth/verify',
    /** POST — tạo tài khoản: mã đã gửi (intent 'signup') + mật khẩu → thẻ phiên */
    signup: '/v1/auth/signup',
    /** POST — đăng nhập bằng email/số + mật khẩu → thẻ phiên */
    login: '/v1/auth/login',
    /** POST — quên mật khẩu: mã đã gửi (intent 'reset') + mật khẩu mới → thẻ phiên */
    resetPassword: '/v1/auth/password/reset',
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
    /** GET — tên riêng này còn trống không */
    usernameCheck: '/v1/username/check',
  },
  media: {
    /** POST — xin đường tải lên đã ký */
    uploadUrl: '/v1/media/upload-url',
    /** POST — báo đã tải xong, server soi lại rồi mới nhận */
    complete: '/v1/media/:id/complete',
    /** GET — đổi sang đường xem đã ký (302) */
    read: '/v1/media/:id',
  },
  admin: {
    /** GET — mấy con số cho trang thống kê trên web */
    stats: '/v1/admin/stats',
    /** GET — danh sách người dùng, lật trang bằng con trỏ */
    users: '/v1/admin/users',
  },
  moment: {
    /** POST — gửi một khoảnh khắc cho cả góc (CHƯA có bên server) */
    create: '/v1/moments',
  },
  setting: {
    /** GET / PATCH — cài đặt của chính mình (CHƯA có bên server) */
    mine: '/v1/me/settings',
  },
  notification: {
    /** GET — thông báo của mình, mới nhất trước (CHƯA có bên server) */
    list: '/v1/notifications',
    /** POST — đánh dấu đã đọc hết (CHƯA có bên server) */
    read: '/v1/notifications/read',
  },
  achievement: {
    /** GET — thành tích của chính mình, kèm số chỗ trong góc */
    mine: '/v1/me/achievements',
  },
  chat: {
    /** GET danh sách cuộc · POST mở cuộc với một người */
    list: '/v1/chats',
    /** GET lịch sử (`before` / `after` = seq) · POST gửi tin (dự phòng của socket) */
    messages: '/v1/chats/:id/messages',
    /** POST — đã đọc tới `seq` */
    read: '/v1/chats/:id/read',
    /** PUT — đổi nền khung chat (chỉ phía mình) */
    background: '/v1/chats/:id/background',
  },
} as const;

/** Dò sống chết. Không nằm trong `/v1`, không cần thẻ. */
export const HEALTH_PATH = '/health';

/** Trang Swagger. Chỉ bật ở máy dev. */
export const DOCS_PATH = '/api/v1/docs';
