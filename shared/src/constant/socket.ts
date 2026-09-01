/**
 * Tên đường và tên sự kiện của ống realtime.
 *
 * Socket là ĐƯỜNG TẮT, không phải lời hứa giao hàng. App bị đẩy ra nền là ống
 * đứt; thứ bảo đảm tới nơi vẫn là bản ghi trong cơ sở dữ liệu cộng với thông
 * báo đẩy. Nối lại thì hỏi lại bằng REST, đừng phát lại qua ống.
 */
export const SOCKET = {
  /** Không gian riêng, để không lẫn với đường mặc định */
  namespace: '/rt',
  /** Tên trường mang thẻ trong `handshake.auth` */
  authField: 'token',
} as const;

/** Server → app. */
export const SOCKET_OUT = {
  /** Bắt tay xong, gửi kèm id người dùng để app biết ống đã nhận đúng ai */
  ready: 'rt.ready',
  /** Phiên bị thu hồi ở nơi khác — app phải tự đá về màn đăng nhập */
  sessionRevoked: 'rt.session_revoked',
} as const;

/** App → server. */
export const SOCKET_IN = {
  /** Dò xem ống còn sống */
  ping: 'rt.ping',
} as const;
