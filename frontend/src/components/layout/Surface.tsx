/**
 * Card / Pill / Divider — ba bề mặt cơ bản.
 * Ba cái, không hơn. Cần cái thứ tư thì hỏi trước: nó khác Card ở chỗ nào?
 */
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, space, useStyles, type Palette } from '@design';
import { Tap } from '../primitives/Tap';

export function Card({
  children,
  onPress,
  raised,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  /** Nổi lên một nấc — dùng cho thẻ đang được chọn. */
  raised?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles(make);
  const box = [s.card, raised && s.raised, style];
  if (!onPress) return <View style={box}>{children}</View>;
  return (
    <Tap onPress={onPress} style={box}>
      {children}
    </Tap>
  );
}

/** Viên thuốc — nhãn nhỏ hoặc nút phụ hình bo tròn hết cỡ. */
export function Pill({
  children,
  onPress,
  onPhoto,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  /** Nền mờ — dùng khi pill nằm đè lên ảnh. */
  onPhoto?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles(make);
  const box = [s.pill, onPhoto && s.pillOnPhoto, style];
  if (!onPress) return <View style={box}>{children}</View>;
  return (
    <Tap onPress={onPress} scaleTo={0.94} style={box}>
      {children}
    </Tap>
  );
}

/** Kẻ mảnh giữa các hàng. Dày đúng 1 pixel THẬT của máy, không phải 1pt. */
export function Divider({ inset }: { inset?: boolean }) {
  const s = useStyles(make);
  return <View style={[s.divider, inset && s.dividerInset]} />;
}

const make = (c: Palette) =>
  StyleSheet.create({
  card: { backgroundColor: c.surface, borderRadius: radius.lg, padding: space.lg },
  raised: { backgroundColor: c.surfaceRaised },

  pill: {
    backgroundColor: c.surface,
    borderRadius: radius.full,
    paddingHorizontal: space.lg,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space.sm,
  },
  pillOnPhoto: { backgroundColor: c.onPhoto },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.borderSoft },
  dividerInset: { marginLeft: space.huge + space.md },
});
