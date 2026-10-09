/**
 * Ảnh — luật chung cho cả hai bên.
 *
 * ── Luật số một: KHÔNG BÓP ẢNH GỐC ──────────────────────────────────────────
 *
 * Không thu nhỏ, không nén lại, không đổi định dạng. Bản gốc lên server đúng
 * từng byte như máy ảnh chụp ra, và **không bao giờ bị xoá**. Đó là sản phẩm.
 *
 * Nên ở đây KHÔNG có `maxWidth`, `maxHeight` hay `quality`. Chỉ có trần dung
 * lượng, và trần đó là để chặn phá hoại chứ không phải để tiết kiệm — 32MB đủ
 * cho ảnh HEIC 48 chấm của iPhone và cả ProRAW.
 *
 * Bản nhẹ cho bảng tin và cho widget là **bản sao thêm**, dựng ra từ bản gốc và
 * xoá lúc nào cũng được vì dựng lại được. Bản gốc thì không.
 */
/** `chat`: ảnh gửi trong chat 1-1 — hai người trong cuộc xem được, vẫn là bản GỐC. */
export const MEDIA_KINDS = ['avatar', 'moment', 'chat'] as const;

/** Trạng thái một tấm ảnh. Dùng tên, đừng gõ chuỗi trần trong mã. */
export const MEDIA_STATUS = {
  /** Đã xin đường tải lên, chưa xác nhận tải xong. */
  PENDING: 'pending',
  /** Đã lên server và soi xong — dùng được. */
  READY: 'ready',
  FAILED: 'failed',
} as const;

export const MEDIA_STATUSES = [
  MEDIA_STATUS.PENDING,
  MEDIA_STATUS.READY,
  MEDIA_STATUS.FAILED,
] as const;

/** Định dạng máy ảnh điện thoại thật sự sinh ra. */
export const MEDIA_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
] as const;

/**
 * Video ngắn của khoảnh khắc (giữ nút chụp). iPhone quay ra `.mov`, Android
 * ra `.mp4`. CHỈ cho `moment` — ảnh đại diện không được là video.
 */
export const MEDIA_VIDEO_TYPES = ['video/mp4', 'video/quicktime'] as const;

export const MEDIA_CONTENT_TYPES = [...MEDIA_IMAGE_TYPES, ...MEDIA_VIDEO_TYPES] as const;

export const MEDIA_LIMITS = {
  /**
   * Trần dung lượng một tệp. KHÔNG phải để tiết kiệm chỗ — để chặn người gửi
   * một tệp 2GB làm nghẽn. Ảnh iPhone 48 chấm dạng HEIC quanh 5–12MB;
   * ProRAW có thể 25MB+. 32MB là chừa dư, không phải chừa vừa.
   */
  maxBytes: 32 * 1024 * 1024,
  /** Đường tải lên đã ký sống bao lâu. Đủ để tải xong một tệp lớn qua mạng yếu. */
  uploadUrlTtlSeconds: 600,
  /** Đường xem đã ký sống bao lâu. Ngắn, vì ký lại thì rẻ. */
  readUrlTtlSeconds: 600,
  /** Video khoảnh khắc dài nhất. App dừng quay ở đây; ngắn là cố ý — đây là khoảnh khắc, không phải clip. */
  videoMaxSeconds: 3,
} as const;

/**
 * Bản nhẹ dựng ra từ bản gốc.
 *
 * ── Vì sao BẮT BUỘC phải có ─────────────────────────────────────────────────
 *
 *   ảnh gốc iPhone   4032x3024   ~3 MB
 *   màn hình cần      1290 rộng
 *   bản `feed`        1290 rộng  ~200 KB   → nhẹ hơn 15 lần
 *   bản `thumb`        320 rộng   ~12 KB   → nhẹ hơn 250 lần
 *
 * Cuộn 20 tấm: bản gốc là 60MB, bản `feed` là 4MB. Trên 4G thì đó là khác biệt
 * giữa 40 giây và 3 giây — cộng thêm một hoá đơn dữ liệu.
 *
 * ── Đây là BẢN SAO THÊM, không thay bản gốc ─────────────────────────────────
 *
 * Bản gốc không bao giờ bị đụng tới và không bao giờ bị xoá. Bản nhẹ thì xoá
 * lúc nào cũng được — dựng lại từ bản gốc là xong. Đó là lý do chúng nằm ở
 * bảng khác chứ không đè lên dòng của bản gốc.
 *
 * WebP chứ không phải JPEG: nhỏ hơn cỡ 30% ở cùng mức nhìn, và cả iOS lẫn
 * Android đều đọc được từ lâu.
 */
export const MEDIA_VARIANTS = ['feed', 'thumb'] as const;

export const VARIANT_SPEC = {
  /** Ảnh trên bảng tin. Đủ nét cho màn hình điện thoại to nhất hiện nay. */
  feed: { width: 1290, quality: 88 },
  /** Mặt bạn bè ở hàng trên, và ảnh đại diện. */
  thumb: { width: 320, quality: 78 },
} as const;

/** Định dạng của mọi bản nhẹ. */
export const VARIANT_FORMAT = 'image/webp';

export const MEDIA_ERR = {
  MEDIA_NOT_FOUND: 'media.not_found',
  /** Định dạng không nằm trong danh sách nhận */
  MEDIA_TYPE_UNSUPPORTED: 'media.type_unsupported',
  /** Vượt trần dung lượng */
  MEDIA_TOO_LARGE: 'media.too_large',
  /** Xin đường tải lên rồi nhưng chưa thấy tệp trong kho */
  MEDIA_NOT_UPLOADED: 'media.not_uploaded',
  /** Ảnh của người khác */
  MEDIA_FORBIDDEN: 'media.forbidden',
} as const;
