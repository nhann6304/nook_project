/**
 * BeadStrand — chuỗi hạt võng xuống như một sợi vòng đang cầm trên tay, ở
 * trang của hai người. Hạt đặc = ký ức đã có; ổ trống nét đứt = hạt còn thiếu
 * để vòng lên chất liệu mới. Không số nào cả, nhìn là hiểu.
 *
 * Hạt mới nhất nảy vào một lần lúc mở trang (Reanimated, luồng UI).
 */
import { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { beadTone, duration, useColors, type BeadTier } from '@design';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const BeadStrand = memo(function BeadStrand({
  width,
  filled,
  empty,
  tier,
  label,
}: {
  width: number;
  filled: number;
  empty: number;
  tier: BeadTier;
  /** Chữ cho trình đọc màn hình. */
  label: string;
}) {
  const c = useColors();
  const tone = beadTone(c, tier);
  const n = Math.max(filled + empty, 1);
  const r = Math.min(13, (width - 8) / (n * 2.25));
  const height = r * 2 + 34;
  const x0 = r + 4;
  const x1 = width - r - 4;
  const top = r + 2;
  const sag = 26;
  // Đường võng bậc hai: P0 (x0, top) → điều khiển (giữa, top + 2·sag) → P2 (x1, top).
  const at = (t: number) => ({
    x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * (width / 2) + t * t * x1,
    y: (1 - t) * (1 - t) * top + 2 * (1 - t) * t * (top + sag * 2) + t * t * top,
  });

  const pop = useSharedValue(0);
  useEffect(() => {
    pop.set(withDelay(duration.slow, withTiming(1, { duration: duration.slow })));
  }, [pop]);
  const last = filled > 0 ? at(n === 1 ? 0.5 : (filled - 1) / (n - 1)) : null;
  const lastProps = useAnimatedProps(() => ({ r: r * (0.4 + 0.6 * pop.value) }));

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label}>
      <Svg width={width} height={height}>
        <Path
          d={`M${x0} ${top} Q${width / 2} ${top + sag * 2} ${x1} ${top}`}
          stroke={c.border}
          strokeWidth={1.5}
          fill="none"
        />
        {Array.from({ length: n }, (_, i) => {
          const p = at(n === 1 ? 0.5 : i / (n - 1));
          if (i >= filled) {
            return (
              <Circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={r * 0.82}
                stroke={c.textDisabled}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill={c.bg}
              />
            );
          }
          if (i === filled - 1) return null;
          return <Bead key={i} x={p.x} y={p.y} r={r} tone={tone} />;
        })}
        {last ? (
          <>
            <AnimatedCircle
              cx={last.x}
              cy={last.y + r * 0.14}
              animatedProps={lastProps}
              fill={tone[2]}
            />
            <AnimatedCircle cx={last.x} cy={last.y} animatedProps={lastProps} fill={tone[0]} />
            <Circle
              cx={last.x - r * 0.3}
              cy={last.y - r * 0.32}
              r={r * 0.34}
              fill={tone[1]}
              opacity={0.9}
            />
          </>
        ) : null}
      </Svg>
    </View>
  );
});

function Bead({
  x,
  y,
  r,
  tone,
}: {
  x: number;
  y: number;
  r: number;
  tone: readonly [string, string, string];
}) {
  return (
    <>
      <Circle cx={x} cy={y + r * 0.14} r={r} fill={tone[2]} />
      <Circle cx={x} cy={y} r={r * 0.9} fill={tone[0]} />
      <Circle cx={x - r * 0.3} cy={y - r * 0.32} r={r * 0.34} fill={tone[1]} opacity={0.9} />
    </>
  );
}
