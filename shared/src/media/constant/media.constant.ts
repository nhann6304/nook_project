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
export const MEDIA_KINDS = ['avatar', 'moment'] as const;

export const MEDIA_STATUSES = ['pending', 'ready', 'failed'] as const;

/** Định dạng máy ảnh điện thoại thật sự sinh ra. */
export const MEDIA_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
] as const;

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
} as const;

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
