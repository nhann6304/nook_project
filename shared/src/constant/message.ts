/**
 * Mã THÔNG BÁO — cho việc chạy trót lọt. Anh em song sinh với `ERR`.
 *
 * Cũng như mã lỗi: **server trả MÃ, app tra ra chữ.** Không có câu tiếng Việt
 * nào rời khỏi server. Ai muốn đổi "Đã gửi mã" thành "Mã đang bay tới bạn" thì
 * sửa kho chữ của app, không đụng backend.
 *
 * Mặc định là `OK`. Chỉ đặt mã riêng khi app THẬT SỰ cần nói một câu khác —
 * đặt mã cho mọi cửa là tự tạo ra một danh sách không ai dùng tới.
 */
export const MSG = {
  /** Xong. Không có gì đặc biệt để nói. */
  OK: 'ok',

  CODE_SENT: 'auth.code_sent',
  SIGNED_IN: 'auth.signed_in',
  TOKEN_REFRESHED: 'auth.token_refreshed',
  SIGNED_OUT: 'auth.signed_out',

  PROFILE_UPDATED: 'user.profile_updated',
} as const;

export type MsgCode = (typeof MSG)[keyof typeof MSG];
