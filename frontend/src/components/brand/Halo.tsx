/**
 * Halo — vầng sáng ấm sau vật thể chính.
 *
 * Ba vòng tròn lồng nhau thay cho gradient tròn: trên nền gần đen mắt không
 * phân biệt được nó với gradient thật, mà đỡ hẳn một lớp vẽ.
 *
 * `breathe` cho nó phồng lên xẹp xuống rất chậm. Nhịp thở này chạy hoàn toàn
 * trên luồng UI bằng Reanimated — luồng JS có đang bận mở camera thì nó vẫn
 * đều nhịp, không giật cục. Nó cũng tự tắt khi người dùng bật "giảm chuyển
 * động" trong Cài đặt máy.
 */
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { alpha } from '@design';
import { useReduceMotion } from '@/hooks/useReduceMotion';

export const Halo = memo(function Halo({
  size = 200,
  breathe = false,
  children,
}: {
  size?: number;
  breathe?: boolean;
  children?: React.ReactNode;
}) {
  const t = useSharedValue(0);
  const reduced = useReduceMotion();

  useEffect(() => {
    if (!breathe || reduced) {
      t.value = 0;
      return;
    }
    t.value = withRepeat(
      withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [breathe, reduced, t]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + t.value * 0.06 }],
    opacity: 0.82 + t.value * 0.18,
  }));

  return (
    <View style={[s.box, { width: size, height: size }]}>
      <Animated.View style={[s.box, StyleSheet.absoluteFill, anim]}>
        <Ring size={size} scale={1} bg={alpha.glowFaint} />
        <Ring size={size} scale={0.72} bg={alpha.glowSoft} />
        <Ring size={size} scale={0.48} bg={alpha.glowStrong} />
      </Animated.View>
      {children}
    </View>
  );
});

function Ring({ size, scale, bg }: { size: number; scale: number; bg: string }) {
  const d = size * scale;
  return (
    <View
      pointerEvents="none"
      style={[s.ring, { width: d, height: d, borderRadius: d / 2, backgroundColor: bg }]}
    />
  );
}

const s = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
});
