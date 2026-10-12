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
  /** Dọn dẹp định kỳ. Hiện có: xoá sổ đăng nhập quá 180 ngày. */
  sweep: 'sweep',
  /** Thư không phải mã 6 số — hiện có: báo đăng nhập lạ. */
  mail: 'mail',
  /** Chép hồ sơ từ Postgres sang Elasticsearch. */
  search: 'search',

  job: {
    /** Dựng bản `feed` và `thumb` từ bản gốc. */
    buildVariants: 'media.build-variants',
    /** Đọc lại một người từ Postgres rồi ghi (hoặc xoá) bản trong chỉ mục. */
    indexUser: 'search.index-user',
    /** Gửi thư "Có đăng nhập mới vào LOVO" cho một dòng `auth_events`. */
    loginAlert: 'mail.login-alert',
    /** Xoá `auth_events` cũ hơn hạn giữ. Lặp hằng ngày (job scheduler). */
    purgeAuthEvents: 'sweep.purge-auth-events',
  },
} as const;

export type TQueueName = 'media' | 'push' | 'sweep' | 'search' | 'mail';

/** Việc dựng bản nhẹ chỉ cần đúng một thứ: tấm nào. */
export interface IBuildVariantsJob {
  mediaId: string;
}

/** Chỉ mang id: việc chạy lúc nào cũng đọc bản MỚI NHẤT trong Postgres. */
export interface IIndexUserJob {
  userId: string;
}

/** Chỉ mang id dòng sổ: việc chạy tự đọc máy, nước, giờ — và địa chỉ thư — từ Postgres. */
export interface ILoginAlertJob {
  eventId: string;
}
