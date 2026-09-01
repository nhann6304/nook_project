/**
 * Img — mọi ảnh trong Nook đi qua đây.
 *
 * Bọc expo-image chứ không phải <Image> của React Native. Ba lý do, đều là
 * hiệu năng thật, không phải sở thích:
 *
 *   1. Có cache đĩa + cache bộ nhớ sẵn. <Image> của RN tải lại ảnh mỗi lần
 *      component vào lại màn.
 *   2. Giải mã ảnh chạy ngoài luồng chính → cuộn feed không khựng.
 *   3. `recyclingKey` — bắt buộc khi ảnh nằm trong danh sách tái dùng ô
 *      (FlashList). Thiếu nó thì cuộn nhanh sẽ thấy ảnh người này nhấp nháy ở
 *      ô của người kia trước khi ảnh đúng kịp về.
 *
 * `transition` 180ms cho ảnh hiện ra chứ không đập vào mắt.
 */
import { Image, type ImageProps } from 'expo-image';
import { StyleSheet } from 'react-native';
import { duration, useStyles, type Palette } from '@design';

export type ImgProps = ImageProps & {
  /** Bắt buộc truyền khi ảnh nằm trong danh sách tái dùng ô. */
  recyclingKey?: string;
};

export function Img({ style, ...rest }: ImgProps) {
  const s = useStyles(make);
  return (
    <Image
      contentFit="cover"
      transition={duration.base}
      cachePolicy="memory-disk"
      style={[s.base, style]}
      {...rest}
    />
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
  // Nền cùng màu bề mặt: lúc ảnh chưa về thì thấy một ô xám, không thấy lỗ đen.
  base: { backgroundColor: c.surface },
});
