/**
 * Radar "bạn bè quanh đây" — vòng tròn đồng tâm, mình ở giữa, người quanh
 * đây đặt quanh theo NẤC khoảng cách (không phải toạ độ thật — server không
 * bao giờ trả toạ độ). Góc đặt suy ra từ id nên mỗi lần vẽ người đứng yên một
 * chỗ, không nhảy lung tung.
 *
 * Một vòng sóng lan ra mãi bằng Reanimated (transform + opacity, luồng UI).
 * Tối đa `MAX_DOTS` người trên vòng; đông hơn thì xem danh sách bên dưới.
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
import Svg, { Circle } from 'react-native-svg';
import { Avatar, Tap } from '@ui';
import { radius, useColors, useStyles, type Palette } from '@design';
import type { NearbyPerson, Radius } from '../lib/nearbyApi';

const MAX_DOTS = 8;
const DOT = 46;
const ME = 64;
const PULSE_MS = 2600;

/** Băm id thành góc 0–2π — cùng id, cùng chỗ. */
function angleOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 360) * Math.PI) / 180;
}

export const Radar = memo(function Radar({
  size,
  radius: max,
  people,
  meName,
  meUri,
  onPick,
}: {
  size: number;
  radius: Radius;
  people: readonly NearbyPerson[];
  meName: string;
  meUri?: string;
  onPick: (id: string) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.set(
      withRepeat(withTiming(1, { duration: PULSE_MS, easing: Easing.out(Easing.quad) }), -1),
    );
  }, [pulse]);

  const wave = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - pulse.value),
    transform: [{ scale: 0.25 + pulse.value * 0.75 }],
  }));

  const half = size / 2;
  const reach = half - DOT / 2 - 4;

  return (
    <View style={[s.box, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={half}
          cy={half}
          r={half - 1}
          fill={c.accent}
          fillOpacity={0.06}
          stroke={c.accent}
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
        <Circle
          cx={half}
          cy={half}
          r={half * 0.66}
          fill="none"
          stroke={c.accent}
          strokeOpacity={0.2}
          strokeWidth={1}
        />
        <Circle
          cx={half}
          cy={half}
          r={half * 0.33}
          fill="none"
          stroke={c.accent}
          strokeOpacity={0.2}
          strokeWidth={1}
        />
      </Svg>
      <Animated.View pointerEvents="none" style={[s.wave, { width: size, height: size }, wave]} />

      {people.slice(0, MAX_DOTS).map((p) => {
        // Nấc gần thì gần tâm: trong bán kính đang chọn, tỉ lệ theo nấc, kẹp 0.42–1.
        const k = Math.min(1, Math.max(0.42, p.within / max));
        const a = angleOf(p.id);
        const x = half + Math.cos(a) * reach * k - DOT / 2;
        const y = half + Math.sin(a) * reach * k - DOT / 2;
        return (
          <Tap
            key={p.id}
            onPress={() => onPick(p.id)}
            scaleTo={0.9}
            feedback="select"
            style={[s.dot, { left: x, top: y }]}
            accessibilityLabel={p.name}
          >
            <Avatar name={p.name} uri={p.uri} size={DOT} ring={false} recyclingKey={p.id} />
            <View style={s.live} />
          </Tap>
        );
      })}

      <View style={[s.me, { left: half - ME / 2, top: half - ME / 2 }]} pointerEvents="none">
        <Avatar name={meName} uri={meUri} size={ME} level={10} />
      </View>
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    box: { alignSelf: 'center' },
    wave: {
      position: 'absolute',
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: c.accent,
    },
    dot: { position: 'absolute', width: DOT, height: DOT },
    live: {
      position: 'absolute',
      right: 0,
      bottom: 2,
      width: 12,
      height: 12,
      borderRadius: radius.full,
      backgroundColor: c.mint,
      borderWidth: 2,
      borderColor: c.bg,
    },
    me: {
      position: 'absolute',
      width: ME,
      height: ME,
      borderRadius: radius.full,
      shadowColor: c.accent,
      shadowOpacity: 0.5,
      shadowRadius: 16,
      // Chỉ bóng iOS: `elevation` của Android trên khung trong suốt vẽ ra viền xám.
      shadowOffset: { width: 0, height: 0 },
    },
  });
