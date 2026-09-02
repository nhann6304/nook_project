import type { TMediaKind, TMediaStatus, TMediaVariant } from '../type/index.js';

// ── POST /v1/media/upload-url ───────────────────────────────────────────────

export interface ICreateUploadBody {
  kind: TMediaKind;
  /** Kiểu tệp máy ảnh sinh ra, ví dụ `image/heic`. */
  contentType: string;
  /** Dung lượng thật, tính bằng byte. Server kiểm lại sau khi tải xong. */
  byteSize: number;
  /** Kích thước ảnh, nếu app biết. Chỉ để hiện khung trước khi ảnh về. */
  width?: number;
  height?: number;
}

export interface ICreateUploadResult {
  mediaId: string;
  /**
   * Đường tải lên đã ký. App `PUT` thẳng bytes vào đây — **không đi qua
   * server**. Một tấm ảnh 12MB mà đi qua Node là tốn hai lần băng thông và
   * chiếm bộ nhớ suốt lúc tải.
   */
  uploadUrl: string;
  /** Phải đính đúng mấy header này khi PUT, không thì chữ ký không khớp. */
  headers: Record<string, string>;
  expiresInSeconds: number;
}

// ── GET /v1/media/:id ───────────────────────────────────────────────────────

/**
 * Một tấm ảnh, nhìn từ phía người được xem nó.
 *
 * ── Ảnh này của ai, và ai được xem ──────────────────────────────────────────
 *
 * `ownerId` là người tải lên. Nhưng **quyền xem KHÔNG nằm ở đây** — nó nằm ở
 * chỗ tấm ảnh được gắn vào:
 *
 *   avatar  người trong góc của chủ ảnh xem được
 *   moment  chỉ những người mà khoảnh khắc đó được gửi tới
 *
 * Cùng một tấm ảnh gắn vào hai khoảnh khắc khác nhau thì có hai tập người xem
 * khác nhau. Nhét một danh sách quyền vào bảng ảnh là chép lại một sự thật đã
 * nằm ở chỗ khác, và hai bản chép thì sẽ có ngày lệch nhau.
 *
 * Chặng này chưa có góc bạn bè nên luật tạm là: **chỉ chủ ảnh xem được.**
 */
export interface IMedia {
  id: string;
  ownerId: string;
  kind: TMediaKind;
  status: TMediaStatus;
  contentType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  /**
   * Đường xem. Là đường của SERVER (`/v1/media/<id>`), không phải đường đã ký
   * của kho — đường đã ký hết hạn sau vài phút, để nó vào một câu trả lời được
   * lưu lại là để một thứ hỏng sẵn.
   */
  url: string;
  createdAt: string;

  /**
   * Mấy bản nhẹ đã dựng xong. Thiếu bản nào thì app cứ dùng `url` (bản gốc) —
   * chậm hơn nhưng không bao giờ trống.
   *
   *   { feed: '/v1/media/<id>?variant=feed', thumb: '/v1/media/<id>?variant=thumb' }
   */
  variants: Partial<Record<TMediaVariant, string>>;
}
