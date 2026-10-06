import { MEDIA_CONTENT_TYPES, MEDIA_VIDEO_TYPES } from '@nook/shared';

/**
 * Đuôi tệp đặt cho bản gốc trên kho.
 *
 * Chỉ backend cần: app chọn ảnh rồi gửi content-type, nó không đặt tên tệp.
 * Khoá phủ đúng `MEDIA_CONTENT_TYPES`, thiếu một cái là không biên dịch được.
 */
type TContentType = (typeof MEDIA_CONTENT_TYPES)[number];

export const CONTENT_TYPE_EXT: Record<TContentType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

/** Video thì không dựng bản nhẹ (`sharp` chỉ đọc ảnh) và không làm ảnh đại diện được. */
export function isVideo(contentType: string): boolean {
  return (MEDIA_VIDEO_TYPES as readonly string[]).includes(contentType);
}

/** Đuôi cho một kiểu tệp, kiểu nào lạ thì `bin`. */
export function extFor(contentType: string): string {
  return CONTENT_TYPE_EXT[contentType as TContentType] ?? 'bin';
}
