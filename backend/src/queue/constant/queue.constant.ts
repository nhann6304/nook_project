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
  /** Chép hồ sơ từ Postgres sang Elasticsearch. */
  search: 'search',

  job: {
    /** Dựng bản `feed` và `thumb` từ bản gốc. */
    buildVariants: 'media.build-variants',
    /** Đọc lại một người từ Postgres rồi ghi (hoặc xoá) bản trong chỉ mục. */
    indexUser: 'search.index-user',
  },
} as const;

export type TQueueName = 'media' | 'push' | 'sweep' | 'search';

/** Việc dựng bản nhẹ chỉ cần đúng một thứ: tấm nào. */
export interface IBuildVariantsJob {
  mediaId: string;
}

/** Chỉ mang id: việc chạy lúc nào cũng đọc bản MỚI NHẤT trong Postgres. */
export interface IIndexUserJob {
  userId: string;
}
