/**
 * Wordmark — chữ "LOVO" (đổi tên 07/10/2026, thay "nook"), vẽ bằng hình chứ
 * không gõ bằng phông: phông tải hụt thì tên thương hiệu không được phép rơi
 * về phông hệ thống, và nét phải đều nhau ở mọi cỡ.
 *
 * Chữ "O" đầu là TRÁI TIM màu nhấn — đúng logo trong bảng thiết kế. Chữ "O"
 * cuối TO hơn các chữ khác một chút và là MẶT CƯỜI (07/10/2026). Nét dày bo
 * tròn, cùng giọng với bộ icon.
 *
 * Hình học: viewBox 280×100, đường giữa nét. Đổi số ở đây thì đổi cả
 * docs/01-brand.md và `assets/images/*.png` (dựng bằng scripts/brand-icons.mjs).
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { space, useColors, useStyles } from '@design';

const VB_W = 280;
const VB_H = 100;
const STROKE = 14;

/** Trái tim thay chữ "O" — hai thuỳ tròn, đáy nhọn mềm. */
export const HEART =
  'M98 86C78 72 68 60 68 44C68 32 77 24 87 24C93 24 97 28 98 32C99 28 103 24 109 24C119 24 128 32 128 44C128 60 118 72 98 86Z';

export type WordmarkProps = {
  /** Chiều CAO. Bề ngang tự tính theo — không kéo méo được. */
  size?: number;
  /** Một màu chữ — dùng khi đặt trên nền màu, hoặc khi in một màu. */
  mono?: boolean;
};

export const Wordmark = memo(function Wordmark({ size = 34, mono = false }: WordmarkProps) {
  const c = useColors();
  const width = (size * VB_W) / VB_H;
  const ink = c.text;
  const heart = mono ? ink : c.accent;

  return (
    <View accessible accessibilityRole="header" accessibilityLabel="LOVO" collapsable={false}>
      <Svg width={width} height={size} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        <Path d="M14 16V84H52" stroke={ink} {...LINE} />
        <Path d={HEART} stroke={heart} {...LINE} fill={heart} fillOpacity={0.18} />
        <Path d="M142 16L164 84L186 16" stroke={ink} {...LINE} />
        <Circle cx={232} cy={50} r={35} stroke={ink} {...LINE} />
        <Circle cx={220} cy={42} r={5.5} fill={ink} />
        <Circle cx={244} cy={42} r={5.5} fill={ink} />
        <Path d="M217 58Q232 72 247 58" stroke={heart} {...LINE} strokeWidth={9} />
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
