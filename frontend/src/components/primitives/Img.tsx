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
import { useState } from 'react';
import { Image, type ImageProps } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { duration, useStyles, type Palette } from '@design';
import { Shimmer } from '../feedback/Shimmer';

export type ImgProps = ImageProps & {
  /** Bắt buộc truyền khi ảnh nằm trong danh sách tái dùng ô. */
  recyclingKey?: string;
  /**
   * Vệt sáng lướt trong lúc ảnh chưa về. Bật cho ảnh LỚN (khoảnh khắc, lưới);
   * ảnh nhỏ như avatar thì ô xám là đủ, thêm vệt sáng chỉ làm màn rối.
   */
  shimmer?: boolean;
};

export function Img({ style, shimmer = false, onLoad, ...rest }: ImgProps) {
  const s = useStyles(make);
  const [loaded, setLoaded] = useState(false);

  const image = (
    <Image
      contentFit="cover"
      transition={duration.base}
      cachePolicy="memory-disk"
      style={[s.base, shimmer ? StyleSheet.absoluteFill : style]}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      {...rest}
    />
  );
  if (!shimmer) return image;

  // Bọc một lớp để vệt sáng nằm đúng khung ảnh; khung lấy style của ảnh.
  return (
    <View style={[s.frame, style]}>
      {loaded ? null : <Shimmer style={StyleSheet.absoluteFill} />}
      {image}
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    // Nền cùng màu bề mặt: lúc ảnh chưa về thì thấy một ô xám, không thấy lỗ đen.
    base: { backgroundColor: c.surface },
    frame: { overflow: 'hidden' },
  });
