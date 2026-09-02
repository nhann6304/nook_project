/**
 * Tên hàng đợi và tên việc. Khai một chỗ để bên bỏ việc vào và bên lấy việc ra
 * không gõ lệch một chữ — gõ lệch thì việc rơi vào một hàng đợi không ai nghe,
 * và im lặng, mãi mãi.
 */
export const QUEUE = {
  /** Dựng bản nhẹ, dọn ảnh treo. */
  media: 'media',
  /** Thông báo đẩy. Chưa có việc nào. */
  push: 'push',
  /** Dọn dẹp định kỳ: phiên hết hạn, mã treo. Chưa có việc nào. */
  sweep: 'sweep',

  job: {
    /** Dựng bản `feed` và `thumb` từ bản gốc. */
    buildVariants: 'media.build-variants',
  },
} as const;

export type TQueueName = 'media' | 'push' | 'sweep';

/** Việc dựng bản nhẹ chỉ cần đúng một thứ: tấm nào. */
export interface IBuildVariantsJob {
  mediaId: string;
}
