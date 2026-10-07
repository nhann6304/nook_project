/**
 * Cắt ảnh về đúng KHUNG người dùng đã thấy lúc ngắm (tỉ lệ `layout.cameraFrameRatio`).
 *
 * Máy chụp ra 3:4, khung ngắm chỉ hiện phần giữa. Không cắt thì ảnh gửi đi có
 * thêm hai dải trên dưới mà người chụp chưa từng thấy. Đi qua bộ xử lý ảnh
 * cũng "nướng" luôn hướng xoay EXIF vào điểm ảnh — có máy Android chỉ ghi
 * hướng vào EXIF, chỗ hiển thị nào bỏ qua EXIF là thấy ảnh nằm ngược.
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { layout } from '@design';

/** Cạnh dài nhất gửi đi. Đủ nét trên màn điện thoại, nhẹ cho mạng. */
const MAX_SIDE = 1440;

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
  if (height > MAX_SIDE) {
    ctx.resize({ width: Math.round(MAX_SIDE * ratio), height: MAX_SIDE });
  }
  const out = await (
    await ctx.renderAsync()
  ).saveAsync({
    compress: 0.85,
    format: SaveFormat.JPEG,
  });
  return out.uri;
}
