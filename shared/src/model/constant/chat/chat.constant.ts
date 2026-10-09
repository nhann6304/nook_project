/**
 * Chat — hằng số chung cho app và server (09/10/2026).
 *
 * Tin nhắn đi qua SOCKET cho nhanh (như Telegram: không mở kết nối HTTP mới
 * cho mỗi tin), REST là đường dự phòng và đường lấy lịch sử. Mỗi tin mang
 * `clientId` do app sinh — gửi lại vì mạng chập chờn thì server nhận ra và
 * trả đúng tin cũ, không thành hai tin.
 */

export const CHAT_MESSAGE_KINDS = ['text', 'sticker', 'image'] as const;

/**
 * Nền khung chat có sẵn. Nền là của RIÊNG từng người cho từng cuộc — mình đổi
 * nền không làm đổi nền bên kia.
 */
export const CHAT_BACKGROUNDS = [
  'default',
  'sky',
  'sunset',
  'mint',
  'lavender',
  'peach',
  'night',
  'doodle',
] as const;

export const CHAT_LIMITS = {
  /** Ký tự tối đa của một tin chữ. */
  chatTextMax: 4000,
  /** Số tin mỗi trang lịch sử. */
  chatPageSize: 40,
  /** Dài tối đa của `clientId`. */
  chatClientIdMax: 64,
} as const;

/** Tên khoá mang tiền tố miền — xem ghi chú ở `catalog/error.constant.ts`. */
export const CHAT_ERR = {
  CHAT_NOT_FOUND: 'chat.not_found',
  CHAT_NOT_MEMBER: 'chat.not_member',
  CHAT_EMPTY_MESSAGE: 'chat.empty_message',
  CHAT_BAD_STICKER: 'chat.bad_sticker',
} as const;

/** Sự kiện realtime của chat. Server → app. */
export const CHAT_SOCKET_OUT = {
  /** Có tin mới (của mình ở máy khác, hoặc của người kia). */
  message: 'chat.message',
  /** Người kia đã đọc tới `seq`. */
  read: 'chat.read',
  /** Người kia đang gõ — app tự tắt sau vài giây nếu không nghe thêm. */
  typing: 'chat.typing',
  /** Người kia vào / rời mạng. */
  presence: 'chat.presence',
} as const;

/** Sự kiện realtime của chat. App → server (có ack). */
export const CHAT_SOCKET_IN = {
  /** Gửi tin — ack trả về tin đã lưu (có `id`, `seq`). */
  send: 'chat.send',
  /** Báo đã đọc tới `seq`. */
  read: 'chat.read',
  /** Đang gõ. App gửi tối đa mỗi 3 giây một lần. */
  typing: 'chat.typing',
} as const;

/** App dừng hiện "đang gõ…" sau từng này mili giây không nghe thêm. */
export const CHAT_TYPING_TTL_MS = 4000;
