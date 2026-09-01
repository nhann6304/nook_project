/**
 * Tên hàng đợi. Khai một chỗ để bên bỏ việc vào và bên lấy việc ra không gõ
 * lệch một chữ — gõ lệch thì việc rơi vào một hàng đợi không ai nghe, và im
 * lặng, mãi mãi.
 */
export const QUEUE = {
  /** Thông báo đẩy. */
  push: 'push',
  /** Cắt cỡ ảnh sau khi tải lên. */
  media: 'media',
  /** Dọn dẹp định kỳ: phiên hết hạn, mã treo, ảnh mồ côi. */
  sweep: 'sweep',
} as const;

export type TQueueName = (typeof QUEUE)[keyof typeof QUEUE];
