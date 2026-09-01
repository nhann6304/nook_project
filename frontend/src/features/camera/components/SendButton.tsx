/**
 * Nút gửi — thay chỗ nút chụp sau khi đã có ảnh.
 *
 * Cùng đường kính với nút chụp (72) để hàng dưới không nhảy khi đổi giữa hai
 * nút. Khác về ruột: nút chụp là vòng rỗng viền dày, nút gửi là khối ĐẶC có
 * mũi tên — nhìn phát biết đây không còn là "bấm để chụp" nữa.
 */
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tap } from '@ui';
import { GRADIENT_END, GRADIENT_START, radius, useColors, useStyles, type Palette } from '@design';

const SIZE = 72;

export function SendButton({
  onPress,
  busy = false,
  label,
}: {
  onPress: () => void;
  busy?: boolean;
  label: string;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy }}
      disabled={busy}
      feedback="confirm"
      scaleTo={0.93}
      onPress={onPress}
      style={s.box}
    >
      <LinearGradient
        colors={c.gradient}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={s.fill}
        pointerEvents="none"
      />
      {busy ? (
        <ActivityIndicator color={c.onAccent} />
      ) : (
        <Ionicons name="arrow-up" size={30} color={c.onAccent} />
      )}
    </Tap>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: c.accent,
  },
  fill: StyleSheet.absoluteFillObject,
});
