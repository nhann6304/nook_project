/**
 * Wordmark — "LOVO" (bản 07/10/2026 theo logo mẫu): chữ PHỒNG nét dày bo
 * tròn, chữ O đầu là TRÁI TIM KÍNH phát sáng, chữ "o" cuối là MẶT CƯỜI.
 * Vẽ bằng hình chứ không gõ phông: phông tải hụt thì tên thương hiệu không
 * được phép rơi về phông hệ thống.
 *
 * Phát sáng bằng ba nét chồng nhau (rộng → hẹp, mờ → rõ), KHÔNG dùng bộ lọc
 * blur của SVG — Android vẽ lại bộ lọc mỗi khung hình. Icon app thì dùng blur
 * thật, vì nó là ảnh tĩnh (`scripts/brand-icons.mjs`).
 *
 * Hình học: viewBox 300×130. Đổi số ở đây thì đổi cả `scripts/brand-icons.mjs`.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { space, useColors, useStyles } from '@design';

const VB_W = 300;
const VB_H = 130;
const STROKE = 26;

const L = 'M34 28V92H70';
const V = 'M168 50L186 94L204 50';
export const HEART =
  'M117 101C93 86 82 72 82 56C82 42 92 33 104 33C110 33 115 37 117 42C119 37 124 33 130 33C142 33 152 42 152 56C152 72 141 86 117 101Z';
const O = { cx: 254, cy: 70, r: 33 } as const;
const SMILE = 'M240 76Q254 90 268 76';
/** Bóng chữ lệch xuống — cho cảm giác phồng mà không cần bộ lọc. */
const DROP = 4;

export type WordmarkProps = {
  /** Chiều CAO. Bề ngang tự tính theo — không kéo méo được. */
  size?: number;
  /** Một màu — dùng khi in một màu. */
  mono?: boolean;
};

export const Wordmark = memo(function Wordmark({ size = 34, mono = false }: WordmarkProps) {
  const c = useColors();
  const width = (size * VB_W) / VB_H;
  const ink = c.text;
  const glow = mono ? ink : c.accentBright;
  const shade = c.shadow;

  return (
    <View accessible accessibilityRole="header" accessibilityLabel="LOVO" collapsable={false}>
      <Svg width={width} height={size} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {/* bóng */}
        <Path d={L} stroke={shade} {...LINE} opacity={0.18} translateY={DROP} />
        <Path d={V} stroke={shade} {...LINE} opacity={0.18} translateY={DROP} />
        <Circle cx={O.cx} cy={O.cy + DROP} r={O.r} fill={shade} opacity={0.18} />
        {/* chữ */}
        <Path d={L} stroke={ink} {...LINE} />
        <Path d={V} stroke={ink} {...LINE} />
        <Circle cx={O.cx} cy={O.cy} r={O.r} fill={ink} />
        <Circle cx={O.cx - 11} cy={O.cy - 7} r={4.6} fill={c.bg} />
        <Circle cx={O.cx + 11} cy={O.cy - 7} r={4.6} fill={c.bg} />
        <Path d={SMILE} stroke={c.bg} strokeWidth={6} strokeLinecap="round" fill="none" />
        {/* tim kính phát sáng */}
        <Path d={HEART} fill={glow} fillOpacity={0.22} />
        <Path d={HEART} stroke={glow} strokeWidth={14} strokeOpacity={0.12} fill="none" />
        <Path d={HEART} stroke={glow} strokeWidth={8} strokeOpacity={0.28} fill="none" />
        <Path
          d={HEART}
          stroke={mono ? ink : c.accent}
          strokeWidth={3.6}
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
});

/** Nét chung. Bo tròn hai đầu — cùng giọng với bộ icon. */
const LINE = {
  strokeWidth: STROKE,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

/** Dấu hiệu + chữ nằm ngang. Chỉ dùng ở màn Chào mừng. */
export function Lockup({ children }: { children?: React.ReactNode }) {
  const s = useStyles(make);
  return <View style={s.lockup}>{children}</View>;
}

const make = () =>
  StyleSheet.create({
    lockup: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  });
