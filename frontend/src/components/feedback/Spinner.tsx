/**
 * Spinner — vòng chờ của Nook: một cung tròn quay, đuôi mờ dần. Thay cho
 * `ActivityIndicator` (mỗi hệ điều hành vẽ một kiểu, Android còn đổi màu theo
 * máy). Quay trên luồng UI, nên lúc luồng JS bận nhất nó vẫn không khựng.
 */
import { memo, useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@design';

const PERIOD = 800;

export const Spinner = memo(function Spinner({
  size = 22,
  color,
  label,
}: {
  size?: number;
  /** Mặc định là màu nhấn. Trên nút chính truyền `c.onAccent`. */
  color?: string;
  label?: string;
}) {
  const c = useColors();
  const turn = useSharedValue(0);

  useEffect(() => {
    turn.set(withRepeat(withTiming(1, { duration: PERIOD, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(turn);
  }, [turn]);

  const anim = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 360}deg` }] }));

  const stroke = Math.max(2, size / 9);
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const tint = color ?? c.accent;

  return (
    <Animated.View
      style={[{ width: size, height: size }, anim]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tint}
          strokeOpacity={0.18}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tint}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${len * 0.28} ${len}`}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
});
