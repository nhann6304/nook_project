/**
 * Kiểu của một khoảnh khắc. Để riêng file này chứ không để trong màn hình:
 * kho trạng thái, dữ liệu mẫu và cả backend sau này đều cần nó, mà không cái
 * nào trong ba cái đó nên phải import một màn hình.
 */

/** Nguồn ảnh: đường dẫn (ảnh vừa chụp, ảnh từ server) hoặc tệp trong bundle. */
export type PhotoSource = string | number;

export type Author = {
  id: string;
  name: string;
  avatar?: PhotoSource;
  /** Cấp thân 1–10. CHỈ hai người trong cặp nhìn thấy — không lộ cho người thứ ba. */
  level: number;
  /** Lâu rồi hai người không gửi gì cho nhau. */
  dormant?: boolean;
};

export type Moment = {
  id: string;
  photo: PhotoSource;
  caption?: string;
  /** Lúc chụp, epoch ms. Nook chỉ giữ 48 giờ nên không cần gì lớn hơn ngày. */
  at: number;
  author: Author;
  /** Ảnh của chính mình. Không có hàng trả lời — không ai tự nhắn cho mình. */
  mine?: boolean;
  /** Đã nhắn lại cho người này chưa (trong lượt mở app này). */
  repliedTo?: boolean;
};
