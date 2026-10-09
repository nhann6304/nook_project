/**
 * Nút chụp. Chạm = chụp ảnh. GIỮ = quay video, thả tay là dừng, tới trần
 * (`maxMs`) thì máy tự dừng. Lúc quay: vòng ngoài chạy kim đồng hồ, lõi co
 * lại thành ô vuông đỏ — kiểu nút quay ai cũng nhận ra.
 *
 * Vòng chạy bằng `strokeDashoffset` của SVG trên luồng UI (useAnimatedProps),
 * không vẽ lại React mỗi khung hình.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { duration, radius, spring, useColors, useStyles, type Palette } from '@design';
import { Tap } from '@ui';

const ARC = Animated.createAnimatedComponent(Circle);
/** Giữ lâu hơn chừng này mới tính là quay — chạm nhanh vẫn là chụp. */
const HOLD_MS = 280;

export function Shutter({
  onPress,
  onHoldStart,
  onHoldEnd,
  recording,
  maxMs = 0,
  busy,
  label,
  size = 84,
}: {
  onPress: () => void;
  /** Có thì giữ nút để quay. */
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  recording?: boolean;
  /** Trần thời lượng quay — vòng chạy hết đúng lúc này. */
  maxMs?: number;
  busy?: boolean;
  label: string;
  size?: number;
}) {
  const s = useStyles(make);
  const c = useColors();
  const p = useSharedValue(0);
  const rec = useSharedValue(0);
  const progress = useSharedValue(0);
  const ring = Math.max(3, Math.round(size / 21));
  const core = size - ring * 2 - Math.round(size / 10.5);
  const r = (size - ring) / 2;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    rec.set(withTiming(recording ? 1 : 0, { duration: duration.fast }));
    if (recording) {
      progress.set(0);
      progress.set(withTiming(1, { duration: maxMs, easing: Easing.linear }));
    } else {
      cancelAnimation(progress);
      progress.set(0);
    }
  }, [maxMs, progress, rec, recording]);

  const coreAnim = useAnimatedStyle(() => ({
    borderRadius: (core / 2) * (1 - rec.value) + radius.sm * rec.value,
    backgroundColor: rec.value > 0.5 ? c.danger : c.core,
    transform: [{ scale: (1 - p.value * 0.08) * (1 - rec.value * 0.45) }],
  }));
  const arc = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: Boolean(busy) }}
      disabled={busy && !recording}
      feedback={null} /* nhịp rung 'capture' do màn gọi, đúng lúc ảnh chụp xong */
      scaleTo={1}
      delayLongPress={HOLD_MS}
      onLongPress={onHoldStart}
      onPressIn={() => {
        p.set(withSpring(1, spring.press));
      }}
      onPressOut={() => {
        p.set(withSpring(0, spring.press));
        // Gọi cả khi chỉ là chạm nhanh — bên nhận phải tự bỏ qua nếu chưa quay.
        onHoldEnd?.();
      }}
      onPress={onPress}
      style={[s.box, { width: size, height: size }]}
    >
      <View pointerEvents="none" style={[s.ring, { borderWidth: ring }]} />
      {recording ? (
        <Svg width={size} height={size} style={s.arc} pointerEvents="none">
          <ARC
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={c.danger}
            strokeWidth={ring}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            animatedProps={arc}
          />
        </Svg>
      ) : null}
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
    // Bắt đầu từ 12 giờ, chạy theo chiều kim đồng hồ.
    arc: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
    core: { borderRadius: radius.full, backgroundColor: c.core },
  });
