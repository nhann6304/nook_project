/**
 * Cắt ảnh về đúng KHUNG người dùng đã thấy lúc ngắm (tỉ lệ `layout.cameraFrameRatio`).
 *
 * Máy chụp ra 3:4, khung ngắm chỉ hiện phần giữa. Không cắt thì ảnh gửi đi có
 * thêm hai dải trên dưới mà người chụp chưa từng thấy. Đi qua bộ xử lý ảnh
 * cũng "nướng" luôn hướng xoay EXIF vào điểm ảnh — có máy Android chỉ ghi
 * hướng vào EXIF, chỗ hiển thị nào bỏ qua EXIF là thấy ảnh nằm ngược.
 *
 * ẢNH GỐC CHO MỌI NGƯỜI, không riêng Pro (08/10/2026): giữ nguyên độ phân giải
 * của phần cắt, chỉ nén JPEG MỘT lần ở 0.92 (máy chụp ở 1.0). Bản cũ nén hai
 * lần 0.8 → 0.85 rồi thu về 1440 — ảnh bết là người ta bỏ app. Bảng tin vẫn
 * nhẹ vì server dựng bản `feed` riêng (`VARIANT_SPEC`), bản gốc giữ để tải về.
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { layout } from '@design';

/** Nén một lần, gần như không thấy được bằng mắt. */
const JPEG_QUALITY = 0.92;

/** Cắt đúng tỉ lệ khung (`layout.cameraFrameRatio`, rộng / cao), lấy phần giữa. */
export async function squarePhoto(uri: string): Promise<string> {
  const full = await ImageManipulator.manipulate(uri).renderAsync();
  const ratio = layout.cameraFrameRatio;
  const width = Math.round(Math.min(full.width, full.height * ratio));
  const height = Math.round(width / ratio);
  const ctx = ImageManipulator.manipulate(full).crop({
    originX: Math.round((full.width - width) / 2),
    originY: Math.round((full.height - height) / 2),
    width,
    height,
  });
  const out = await (
    await ctx.renderAsync()
  ).saveAsync({
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });
  return out.uri;
}
