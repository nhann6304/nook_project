/**
 * Trời phủ CẢ MÀN (08/10/2026 — bản chỉ nửa trên bị chê "trên dưới trống
 * trống"): màu cảnh ở đỉnh, tan vào nền giữa màn, ngả lại màu trời ở đáy như
 * chân trời. Có CẢNH: ban ngày mây trôi (cả trên lẫn dưới), sáng/chiều có mặt
 * trời, đêm sao rải khắp màn + trăng nằm ở khe giữa viên bạn bè và avatar
 * (chỗ trước đó bị avatar che), mưa rơi suốt chiều cao.
 *
 * Mượt trước đã: mỗi lớp là MỘT Svg vẽ một lần, chỉ chạy transform/opacity
 * trên luồng UI (Reanimated). Sao chia ba nhóm nhấp nháy lệch nhịp thay vì
 * hoạt ảnh từng ngôi; mưa là hai tấm lặp trượt dọc.
 */
import { memo, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useColors, useStyles, type Palette } from '@design';

const STOPS = [0, 0.5, 1] as const;

export const SkyWash = memo(function SkyWash() {
  const s = useStyles(make);
  const c = useColors();
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={s.wash}>
      <LinearGradient
        colors={[c.sky[0], c.sky[1], c.skyLow]}
        locations={STOPS}
        style={StyleSheet.absoluteFill}
      />
      <Scene c={c} width={width} height={height} />
    </View>
  );
});

function Scene({ c, width, height }: { c: Palette; width: number; height: number }) {
  switch (c.scene) {
    case 'night':
      return <Stars c={c} width={width} height={height} />;
    case 'rain':
    case 'rainNight':
      return <Rain c={c} width={width} height={height} />;
    default:
      return <Day c={c} width={width} height={height} />;
  }
}

/* ── Ngày: mặt trời (sáng/chiều) + ba đám mây trôi chậm ── */

const CLOUD = 'M10 30a12 12 0 0 1 4-23 16 16 0 0 1 29-2 11 11 0 0 1 17 9 9 9 0 0 1-2 16z';

function Day({ c, width, height }: { c: Palette; width: number; height: number }) {
  const s = useStyles(make);
  const low = c.scene !== 'noon';
  return (
    <>
      {low ? (
        <Svg style={s.sun} width={140} height={140}>
          <Circle cx={70} cy={70} r={66} fill={c.onPhotoText} opacity={0.12} />
          <Circle cx={70} cy={70} r={46} fill={c.onPhotoText} opacity={0.18} />
          <Circle cx={70} cy={70} r={28} fill={c.onPhotoText} opacity={0.55} />
        </Svg>
      ) : null}
      <Drift width={width} top={height * 0.07} scale={1.4} seconds={70} start={0.1} c={c} />
      <Drift width={width} top={height * 0.03} scale={0.7} seconds={120} start={0.55} c={c} />
      <Drift width={width} top={height * 0.74} scale={1.1} seconds={95} start={0.7} c={c} />
      <Drift width={width} top={height * 0.86} scale={0.8} seconds={110} start={0.25} c={c} />
    </>
  );
}

function Drift({
  width,
  top,
  scale,
  seconds,
  start,
  c,
}: {
  width: number;
  top: number;
  scale: number;
  seconds: number;
  start: number;
  c: Palette;
}) {
  const s = useStyles(make);
  const w = 60 * scale;
  const span = width + w * 2;
  const x = useSharedValue(start);
  useEffect(() => {
    // Đi từ chỗ đang đứng ra mép phải, rồi lặp lại từ mép trái — tốc độ đều.
    x.set(
      withSequence(
        withTiming(1, { duration: (1 - start) * seconds * 1000, easing: Easing.linear }),
        withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(1, { duration: seconds * 1000, easing: Easing.linear }),
          ),
          -1,
        ),
      ),
    );
  }, [seconds, start, x]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * span - w }] }));
  return (
    <Animated.View style={[s.layer, { top }, anim]}>
      <Svg width={w} height={36 * scale} viewBox="0 0 62 36">
        <Path d={CLOUD} fill={c.onPhotoText} opacity={c.light ? 0.7 : 0.25} />
      </Svg>
    </Animated.View>
  );
}

/* ── Đêm: trăng khuyết + sao, ba nhóm nhấp nháy lệch nhịp ── */

/** Toạ độ sao cố định (0–1), sinh một lần — mở app lần nào trời cũng như cũ. */
const STARS = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), r: 0.6 + rnd() * 1.2 }));
})();

function Stars({ c, width, height }: { c: Palette; width: number; height: number }) {
  const s = useStyles(make);
  const insets = useSafeAreaInsets();
  return (
    <>
      {/* Khe giữa viên bạn bè và avatar góc phải — chỗ duy nhất trên cùng không
          bị gì che (avatar 44 + lề 16 + khe 8 tính từ mép phải). */}
      <Svg style={[s.moon, { top: insets.top + 2 }]} width={MOON} height={MOON}>
        <Circle cx={MOON / 2} cy={MOON / 2} r={MOON / 2} fill={c.onPhotoText} opacity={0.08} />
        <Circle cx={MOON / 2} cy={MOON / 2} r={MOON * 0.36} fill={c.onPhotoText} opacity={0.12} />
        <Circle cx={MOON / 2} cy={MOON / 2} r={MOON * 0.24} fill={c.onPhotoText} opacity={0.95} />
        <Circle cx={MOON / 2 + MOON * 0.11} cy={MOON / 2 - MOON * 0.08} r={MOON * 0.2} fill={c.sky[0]} />
      </Svg>
      {[0, 1, 2].map((g) => (
        <Twinkle key={g} group={g} c={c} width={width} height={height} />
      ))}
    </>
  );
}

function Twinkle({
  group,
  c,
  width,
  height,
}: {
  group: number;
  c: Palette;
  width: number;
  height: number;
}) {
  const o = useSharedValue(1);
  useEffect(() => {
    o.set(
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: 1400 + group * 500 }),
          withTiming(1, { duration: 1400 + group * 500 }),
        ),
        -1,
      ),
    );
  }, [group, o]);
  return (
    <Fade o={o}>
      <Svg width={width} height={height}>
        {STARS.filter((_, i) => i % 3 === group).map((st, i) => (
          <Circle
            key={i}
            cx={st.x * width}
            cy={st.y * height}
            r={st.r}
            fill={c.onPhotoText}
            opacity={0.8}
          />
        ))}
      </Svg>
    </Fade>
  );
}

function Fade({ o, children }: { o: SharedValue<number>; children: React.ReactNode }) {
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[StyleSheet.absoluteFill, anim]}>{children}</Animated.View>;
}

/* ── Mưa: hai tấm vạch nghiêng trượt xuống, lặp không thấy mối nối ── */

const MOON = 56;

const DROPS = (() => {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), l: 10 + rnd() * 12 }));
})();

function Rain({ c, width, height }: { c: Palette; width: number; height: number }) {
  return (
    <>
      <Fall c={c} width={width} height={height} ms={1100} offset={0} />
      <Fall c={c} width={width} height={height} ms={1600} offset={20} />
    </>
  );
}

function Fall({
  c,
  width,
  height,
  ms,
  offset,
}: {
  c: Palette;
  width: number;
  height: number;
  ms: number;
  offset: number;
}) {
  const s = useStyles(make);
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(withRepeat(withTiming(1, { duration: ms, easing: Easing.linear }), -1));
  }, [ms, y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: (y.value - 1) * height }] }));
  // Hai tấm giống hệt xếp chồng dọc: tấm trên trượt xuống đúng chỗ tấm dưới.
  const sheet = (
    <Svg width={width} height={height}>
      {DROPS.map((d, i) => {
        const x = ((d.x * width + offset) % width) + 0.5;
        const y0 = d.y * height;
        return (
          <Line
            key={i}
            x1={x}
            y1={y0}
            x2={x - 3}
            y2={y0 + d.l}
            stroke={c.onPhotoText}
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={c.light ? 0.6 : 0.3}
          />
        );
      })}
    </Svg>
  );
  return (
    <Animated.View style={[s.fall, { height: height * 2 }, anim]}>
      {sheet}
      {sheet}
    </Animated.View>
  );
}

const make = () =>
  StyleSheet.create({
    wash: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
    layer: { position: 'absolute', left: 0 },
    sun: { position: 'absolute', right: -30, top: -20 },
    moon: { position: 'absolute', right: 68 },
    fall: { position: 'absolute', left: 0, right: 0, top: 0 },
  });
