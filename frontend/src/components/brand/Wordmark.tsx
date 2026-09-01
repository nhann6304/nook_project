/**
 * Wordmark — chữ "nook", vẽ bằng hình chứ không phải gõ bằng phông chữ.
 *
 * ── Ý ở giữa từ ──────────────────────────────────────────────────────────
 * Hai chữ "o" CHÍNH LÀ hai vòng của dấu hiệu (xem Rings): một vòng đậm, một
 * vòng sáng hơn, chồng lên nhau. Cái tên và cái dấu hiệu nói cùng một câu —
 * hai người, một người ôm người kia — nên đặt cạnh nhau chúng không phải là
 * hai thứ rời rạc dán vào nhau.
 *
 * Vì thế luật màu của Rings áp nguyên vào đây: hai vòng PHẢI lệch nhau một nấc
 * sáng. Cùng màu là mất ý "hai người", chỉ còn thấy một cục.
 *
 * ── Vì sao là SVG chứ không phải phông chữ ───────────────────────────────
 *   1. Không phụ thuộc phông. Trước đây wordmark gõ bằng Fredoka; phông tải
 *      hụt là tên thương hiệu rơi về phông hệ thống — thứ duy nhất trong app
 *      KHÔNG được phép trông khác đi.
 *   2. Chữ vẽ bằng phông thì không nhuộm được hai chữ "o" hai màu khác nhau.
 *   3. Nét không đổi độ dày khi phóng to, và nét bo tròn đúng bằng nhau ở mọi
 *      cỡ. Chữ thật thì độ dày nét gắn với cỡ chữ, không tách ra được.
 *
 * Hình học: viewBox 214×106, đường giữa nét. Đổi số ở đây thì đổi cả
 * docs/01-brand.md — đừng sửa một bên.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { color, space } from '@design';

const VB_W = 214;
const VB_H = 106;
const STROKE = 13;

export type WordmarkProps = {
  /** Chiều CAO. Bề ngang tự tính theo — không kéo méo được. */
  size?: number;
  /** Một màu chữ — dùng khi đặt trên nền màu, hoặc khi in một màu. */
  mono?: boolean;
};

export const Wordmark = memo(function Wordmark({ size = 34, mono = false }: WordmarkProps) {
  const width = (size * VB_W) / VB_H;
  const ink = color.text;
  const hug = mono ? ink : color.accent;
  const held = mono ? ink : color.accentBright;

  return (
    <View accessible accessibilityRole="header" accessibilityLabel="nook" collapsable={false}>
      <Svg width={width} height={size} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {/* n — thân đứng + vòm */}
        <Path d="M9 84 V46" stroke={ink} {...LINE} />
        <Path d="M9 63 A17 17 0 0 1 43 63 V84" stroke={ink} {...LINE} />

        {/* o ôm — đậm hơn, nằm dưới */}
        <Circle cx={86} cy={63} r={21} stroke={hug} {...LINE} />
        {/* o được ôm — sáng hơn, nằm trên và chờm lên vòng kia */}
        <Circle cx={132} cy={63} r={21} stroke={held} {...LINE} />

        {/* k — thân cao + hai nét chéo */}
        <Path d="M176 18 V84" stroke={ink} {...LINE} />
        <Path d="M176 70 L202 44" stroke={ink} {...LINE} />
        <Path d="M186 60 L205 84" stroke={ink} {...LINE} />
      </Svg>
    </View>
  );
});

/** Nét chung. Bo tròn hai đầu — cùng ngôn ngữ hình với Rings. */
const LINE = {
  strokeWidth: STROKE,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

/** Dấu hiệu + chữ nằm ngang. Chỉ dùng ở màn Chào mừng. */
export function Lockup({ children }: { children?: React.ReactNode }) {
  return <View style={s.lockup}>{children}</View>;
}

const s = StyleSheet.create({
  lockup: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
