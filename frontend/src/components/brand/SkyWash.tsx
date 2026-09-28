/**
 * Vệt trời ở đầu màn chính — chế độ màu "Tự động" (bảng thiết kế F1). Trời
 * sáng hồng lúc bình minh, vàng lúc trưa, tím lúc hoàng hôn, xanh đêm có sao.
 *
 * Nằm SAU mọi thứ, không bắt chạm. Bảng cố định (`sky = null`) thì không vẽ gì.
 * Sao nhấp nháy chạy trên luồng UI, và tắt hẳn khi người dùng bật giảm chuyển động.
 */
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { radius, useColors, useStyles, type Palette } from '@design';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const HEIGHT = 320;
const STARS = Array.from({ length: 14 }, (_, i) => ({
  x: ((i * 67) % 92) + 3,
  y: ((i * 41) % 170) + 16,
  size: 2 + (i % 3),
  period: 2000 + (i % 4) * 700,
  delay: ((i * 29) % 30) * 100,
}));

export const SkyWash = memo(function SkyWash() {
  const c = useColors();
  const s = useStyles(make);
  if (!c.sky) return null;
  return (
    <View pointerEvents="none" style={s.box}>
      <LinearGradient colors={[c.sky[0], c.sky[1], c.bg]} locations={STOPS} style={s.fill} />
      {c.stars ? STARS.map((st, i) => <Star key={i} {...st} />) : null}
    </View>
  );
});

const STOPS = [0, 0.55, 1] as const;

function Star({ x, y, size, period, delay }: (typeof STARS)[number]) {
  const s = useStyles(make);
  const reduced = useReduceMotion();
  const glow = useSharedValue(0.6);

  useEffect(() => {
    if (reduced) return;
    glow.set(
      withDelay(
        delay,
        withRepeat(
          withTiming(0.2, { duration: period, easing: Easing.inOut(Easing.sin) }),
          -1,
          true,
        ),
      ),
    );
  }, [delay, glow, period, reduced]);

  const anim = useAnimatedStyle(() => ({ opacity: glow.get() }));
  return (
    <Animated.View style={[s.star, { left: `${x}%`, top: y, width: size, height: size }, anim]} />
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    box: { position: 'absolute', left: 0, right: 0, top: 0, height: HEIGHT },
    fill: StyleSheet.absoluteFill,
    star: { position: 'absolute', borderRadius: radius.full, backgroundColor: c.onPhotoText },
  });
