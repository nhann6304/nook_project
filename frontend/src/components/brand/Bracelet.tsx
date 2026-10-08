/**
 * Bracelet — vòng tay hạt quanh avatar, thay vòng cấp thân (08/10/2026).
 *
 * Vòng màu trơn bị chê "chưa đủ chính mùi": nó là thanh tiến độ uốn cong. Ở
 * đây mỗi hạt là ký ức, chất liệu hạt nói độ thân (`beadTier` ở `@design`), và
 * chuỗi dày dần theo cấp. Ngủ đông: hạt xám, không ánh — không mất hạt nào.
 *
 * Hạt có khối bằng ba vòng tròn chồng (bóng · thân · ánh), không gradient,
 * không blur — vẽ một lần, không chạy hoạt ảnh, danh sách dài vẫn nhẹ.
 */
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { beadCount, beadTier, beadTone, sleepingTone, useColors, type BeadTone } from '@design';

export type BraceletProps = {
  size: number;
  level: number;
  dormant?: boolean;
  /** Bán kính hạt. Mặc định theo cỡ. */
  bead?: number;
  /** Màu thân từng hạt (vd. màu rút từ ảnh của từng ngày) — ghi đè chất liệu. */
  colors?: readonly string[];
};

export function beadRadius(size: number) {
  return Math.max(2.2, size * 0.055);
}

export const Bracelet = memo(function Bracelet({
  size,
  level,
  dormant = false,
  bead,
  colors,
}: BraceletProps) {
  const c = useColors();
  const r = bead ?? beadRadius(size);
  const ring = size / 2 - r - 0.5;
  const n = colors?.length ?? beadCount(level);
  const tone: BeadTone = dormant ? sleepingTone(c) : beadTone(c, beadTier(level));
  const rich = size >= 44;
  const mid = size / 2;

  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Circle
        cx={mid}
        cy={mid}
        r={ring}
        stroke={tone[2]}
        strokeWidth={1}
        fill="none"
        opacity={0.5}
      />
      {Array.from({ length: n }, (_, i) => {
        // Bắt đầu ở đỉnh, đi theo chiều kim đồng hồ.
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = mid + ring * Math.cos(a);
        const y = mid + ring * Math.sin(a);
        const body = !dormant && colors?.[i] ? colors[i]! : tone[0];
        return (
          <Bead key={i} x={x} y={y} r={r} body={body} light={tone[1]} shade={tone[2]} rich={rich} />
        );
      })}
    </Svg>
  );
});

function Bead({
  x,
  y,
  r,
  body,
  light,
  shade,
  rich,
}: {
  x: number;
  y: number;
  r: number;
  body: string;
  light: string;
  shade: string;
  rich: boolean;
}) {
  return (
    <>
      <Circle cx={x} cy={y + r * 0.14} r={r} fill={shade} />
      <Circle cx={x} cy={y} r={r * 0.9} fill={body} />
      {rich ? (
        <Circle cx={x - r * 0.3} cy={y - r * 0.32} r={r * 0.36} fill={light} opacity={0.9} />
      ) : null}
    </>
  );
}
