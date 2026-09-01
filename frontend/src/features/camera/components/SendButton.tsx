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
import { color, gradient, radius } from '@design';

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
        colors={gradient.warm}
        start={gradient.start}
        end={gradient.end}
        style={s.fill}
        pointerEvents="none"
      />
      {busy ? (
        <ActivityIndicator color={color.onAccent} />
      ) : (
        <Ionicons name="arrow-up" size={30} color={color.onAccent} />
      )}
    </Tap>
  );
}

const s = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: color.accent,
  },
  fill: StyleSheet.absoluteFillObject,
});
