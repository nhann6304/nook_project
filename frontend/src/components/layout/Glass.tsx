/**
 * Glass — mặt KÍNH MỜ thật (08/10/2026: "thiết kế glass vào chỗ cần, như cái
 * lịch của Locket").
 *
 * iOS: `BlurView` (expo-blur) làm mờ thứ nằm sau + lớp phủ sáng nhẹ + viền
 * mảnh sáng — giống kính. Android: KHÔNG blur (blur trên Android vẽ lại mỗi
 * khung hình, giật), thay bằng nền đặc trong mờ `glassSolid` — nhìn gần giống,
 * không tốn gì. Dùng ở chỗ nổi trên trời / ảnh: thanh tab, viên trên cùng,
 * thẻ tháng của Ký ức, thẻ mã QR.
 */
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { radius as R, useColors, useStyles, type Palette } from '@design';

const IOS = Platform.OS === 'ios';

export function Glass({
  children,
  style,
  radius = R.xl,
  intensity = 40,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** Độ mờ 0–100 (chỉ iOS). */
  intensity?: number;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View style={[s.wrap, { borderRadius: radius }, style]}>
      {IOS ? (
        <BlurView
          intensity={intensity}
          tint={c.light ? 'systemThinMaterialLight' : 'systemThinMaterialDark'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, s.fill]} />
      {children}
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    wrap: {
      overflow: 'hidden',
      borderCurve: 'continuous',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.glassEdge,
    },
    fill: { backgroundColor: IOS ? c.glassFill : c.glassSolid },
  });
