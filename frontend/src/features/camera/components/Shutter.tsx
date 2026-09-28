/**
 * Nút chụp — vòng màu nhấn, lõi sáng PHẲNG. Theo bảng thiết kế: không dải màu
 * trong lõi (dải màu làm nút trông như kẹo), lõi trơn thì trông như máy ảnh.
 *
 * Vòng ngoài đứng yên, LÕI co lại khi nhấn — giống cửa trập thật. Chạy trên
 * luồng UI: lúc chụp là lúc luồng JS bận nhất cả app (mã hoá ảnh).
 *
 * `size` nhỏ dùng cho nút "về camera" ở hàng dưới khi đang xem ảnh bạn bè.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { radius, spring, useStyles, type Palette } from '@design';
import { Tap } from '@ui';

export function Shutter({
  onPress,
  busy,
  label,
  size = 84,
}: {
  onPress: () => void;
  busy?: boolean;
  label: string;
  size?: number;
}) {
  const s = useStyles(make);
  const p = useSharedValue(0);
  const ring = Math.max(3, Math.round(size / 21));
  const core = size - ring * 2 - Math.round(size / 10.5);

  const coreAnim = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - p.value * 0.08 }],
  }));

  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: Boolean(busy) }}
      disabled={busy}
      feedback={null} /* nhịp rung 'capture' do màn gọi, đúng lúc ảnh chụp xong */
      scaleTo={1}
      onPressIn={() => {
        p.set(withSpring(1, spring.press));
      }}
      onPressOut={() => {
        p.set(withSpring(0, spring.press));
      }}
      onPress={onPress}
      style={[s.box, { width: size, height: size }]}
    >
      <View pointerEvents="none" style={[s.ring, { borderWidth: ring }]} />
      <Animated.View style={[s.core, { width: core, height: core }, coreAnim]} />
    </Tap>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    box: { alignItems: 'center', justifyContent: 'center' },
    ring: {
      ...StyleSheet.absoluteFill,
      borderRadius: radius.full,
      borderColor: c.accent,
    },
    core: { borderRadius: radius.full, backgroundColor: c.core },
  });
