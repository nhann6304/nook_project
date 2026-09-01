/**
 * GhostFrame — khung đứt nét: "chỗ này lẽ ra có một tấm ảnh".
 *
 * Đây là hình thay thế cho linh vật (bỏ ngày 31/08/2026). Nó nói ra được điều
 * mà một con vật dễ thương không nói được: cái đang thiếu là gì.
 *
 * Vẽ bằng SVG vì Android vẽ borderStyle:'dashed' cộng borderRadius thành nét
 * LIỀN — đúng cái làm khung ma trông như khung thật.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { color, radius } from '@design';

export const GhostFrame = memo(function GhostFrame({
  size = 160,
  ratio = 1,
  children,
}: {
  size?: number;
  /** Tỉ lệ cao/rộng. 1 = vuông như khung ngắm camera. */
  ratio?: number;
  children?: React.ReactNode;
}) {
  const h = size * ratio;
  return (
    <View style={[s.box, { width: size, height: h }]}>
      <Svg width={size} height={h} style={StyleSheet.absoluteFill}>
        <Rect
          x={1}
          y={1}
          width={size - 2}
          height={h - 2}
          rx={radius.frame}
          stroke={color.border}
          strokeWidth={1.5}
          strokeDasharray="7 8"
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
});

const s = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
