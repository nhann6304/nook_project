/**
 * Cắt ảnh về đúng khung VUÔNG người dùng đã thấy lúc ngắm.
 *
 * Máy chụp ra 3:4, khung ngắm chỉ hiện phần giữa. Không cắt thì ảnh gửi đi có
 * thêm hai dải trên dưới mà người chụp chưa từng thấy. Đi qua bộ xử lý ảnh
 * cũng "nướng" luôn hướng xoay EXIF vào điểm ảnh — có máy Android chỉ ghi
 * hướng vào EXIF, chỗ hiển thị nào bỏ qua EXIF là thấy ảnh nằm ngược.
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Cạnh dài nhất gửi đi. Đủ nét trên màn điện thoại, nhẹ cho mạng. */
const MAX_SIDE = 1440;

export async function squarePhoto(uri: string): Promise<string> {
  const full = await ImageManipulator.manipulate(uri).renderAsync();
  const side = Math.min(full.width, full.height);
  const ctx = ImageManipulator.manipulate(full).crop({
    originX: Math.round((full.width - side) / 2),
    originY: Math.round((full.height - side) / 2),
    width: side,
    height: side,
  });
  if (side > MAX_SIDE) ctx.resize({ width: MAX_SIDE, height: MAX_SIDE });
  const out = await (
    await ctx.renderAsync()
  ).saveAsync({
    compress: 0.85,
    format: SaveFormat.JPEG,
  });
  return out.uri;
}
