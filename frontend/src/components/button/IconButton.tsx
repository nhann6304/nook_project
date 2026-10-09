/**
 * IconButton — nút chỉ có icon.
 *
 * Vùng chạm luôn 48pt kể cả khi icon vẽ 18pt. Icon nhỏ mà vùng chạm nhỏ theo
 * là lỗi phổ biến nhất khiến người dùng "bấm không ăn" — họ bấm trúng nhưng
 * trượt vùng nhận.
 *
 * `label` bắt buộc: không có chữ thì trình đọc màn hình đọc ra "nút", vô nghĩa.
 */
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { HIT_SLOP, layout, radius, useStyles, type Palette } from '@design';
import { Tap, type TapProps } from './Tap';

export type IconButtonProps = Omit<TapProps, 'style'> & {
  /** Chữ cho trình đọc màn hình. Bắt buộc. */
  label: string;
  /** Nền tròn mờ — dùng khi nút nằm đè lên ảnh. */
  onPhoto?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ label, onPhoto, style, children, ...rest }: IconButtonProps) {
  const s = useStyles(make);
  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT_SLOP}
      scaleTo={0.9}
      fadeTo={0.7}
      style={[s.base, onPhoto && s.onPhoto, style]}
      {...rest}
    >
      {children}
    </Tap>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
  base: {
    width: layout.minTouch,
    height: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onPhoto: { borderRadius: radius.full, backgroundColor: c.surface },
});
