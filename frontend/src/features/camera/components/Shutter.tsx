/**
 * Nút chụp.
 *
 * Vòng ngoài đứng yên, LÕI trong co lại khi nhấn — giống cửa trập máy ảnh thật.
 * Cả hai chạy trên luồng UI bằng Reanimated: lúc bấm chụp thì luồng JS đang
 * bận nhất trong cả app (mã hoá ảnh), và nếu phản hồi nhấn chạy bằng JS thì
 * đúng khoảnh khắc quan trọng nhất lại là khoảnh khắc nút đơ.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { color, gradient, radius, spring } from '@design';
import { Tap } from '@ui';

const RING = 72;
const CORE = 58;

export function Shutter({
  onPress,
  busy,
  label,
}: {
  onPress: () => void;
  busy?: boolean;
  label: string;
}) {
  const p = useSharedValue(0);

  const core = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - p.value * 0.18 }],
  }));

  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: Boolean(busy) }}
      disabled={busy}
      feedback={null} /* Shutter tự rung nhịp 'capture' trong màn Camera */
      scaleTo={1}
      onPressIn={() => {
        p.value = withSpring(1, spring.press);
      }}
      onPressOut={() => {
        p.value = withSpring(0, spring.press);
      }}
      onPress={onPress}
      style={s.ring}
    >
      <Animated.View style={[s.core, core]}>
        <LinearGradient
          colors={gradient.warm}
          start={gradient.start}
          end={gradient.end}
          style={s.fill}
        />
      </Animated.View>
      <View pointerEvents="none" style={s.ringLine} />
    </Tap>
  );
}

const s = StyleSheet.create({
  ring: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  ringLine: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: color.accent,
  },
  core: {
    width: CORE,
    height: CORE,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: color.accent,
  },
  fill: StyleSheet.absoluteFillObject,
});
