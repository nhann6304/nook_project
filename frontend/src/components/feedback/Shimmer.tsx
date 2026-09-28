/**
 * Shimmer — khối "đang tải" có vệt sáng lướt qua. Dùng thay chỗ một tấm ảnh
 * hay một dòng chữ chưa về, để khung giữ đúng kích thước (không nhảy bố cục
 * khi nội dung tới) và người ta biết là đang tải chứ không phải trống.
 */
import { memo, useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColors, useStyles, type Palette } from '@design';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const PERIOD = 1300;

export const Shimmer = memo(function Shimmer({ style }: { style?: StyleProp<ViewStyle> }) {
  const s = useStyles(make);
  const c = useColors();
  const reduced = useReduceMotion();
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    x.set(
      withRepeat(withTiming(1, { duration: PERIOD, easing: Easing.inOut(Easing.quad) }), -1, false),
    );
    return () => cancelAnimation(x);
  }, [reduced, x]);

  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: `${-100 + x.get() * 200}%` }],
  }));

  return (
    <View style={[s.box, style]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, sweep]}>
        <LinearGradient
          colors={['transparent', c.surfaceRaised, 'transparent']}
          start={START}
          end={END}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});

const START = { x: 0, y: 0.5 } as const;
const END = { x: 1, y: 0.5 } as const;

const make = (c: Palette) =>
  StyleSheet.create({
    box: { backgroundColor: c.surface, overflow: 'hidden' },
  });
