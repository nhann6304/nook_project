/**
 * QrCode — mã QR vẽ bằng SVG (08/10/2026). Chấm bo tròn, ba "mắt" góc bo mềm
 * — đỡ lạnh hơn mã ô vuông in sẵn. Mức sửa lỗi H (30%) nên chừa được ô giữa
 * cho logo mà máy vẫn quét được.
 *
 * Chỉ dựng ma trận một lần cho mỗi `value` (`useMemo`); vẽ ~1.000 chấm là một
 * Svg tĩnh, không hoạt ảnh.
 */
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import { radius, useStyles } from '@design';
import { Img } from '../primitives/Img';

// Logo LOVO ở giữa mã — đúng tấm icon app.
const LOGO = require('../../../assets/images/icon.png') as number;

/** Ô giữa chừa cho logo — phần trăm cạnh mã. Mức H chịu được tới ~30% diện tích. */
const HOLE = 0.24;

export const QrCode = memo(function QrCode({
  value,
  size,
  color,
  background,
}: {
  value: string;
  size: number;
  color: string;
  background: string;
}) {
  const s = useStyles(make);
  const { n, dots } = useMemo(() => build(value), [value]);
  const cell = size / n;
  const logo = Math.round(size * HOLE);
  const plate = logo + cell * 2;

  return (
    <View style={[s.box, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${n} ${n}`}>
        <Rect x={0} y={0} width={n} height={n} fill={background} />
        <Path d={dots} fill={color} />
        {EYES(n).map(([x, y]) => (
          <Eye key={`${x}-${y}`} x={x} y={y} color={color} background={background} />
        ))}
      </Svg>
      <View
        style={[
          s.logo,
          {
            width: plate,
            height: plate,
            left: (size - plate) / 2,
            top: (size - plate) / 2,
            borderRadius: plate * 0.28,
            backgroundColor: background,
          },
        ]}
      >
        <Img
          source={LOGO}
          style={[s.logoImg, { width: logo, height: logo, borderRadius: logo * 0.24 }]}
        />
      </View>
    </View>
  );
});

/** Góc trên-trái của ba mắt (mỗi mắt 7×7 ô). */
const EYES = (n: number): readonly (readonly [number, number])[] => [
  [0, 0],
  [n - 7, 0],
  [0, n - 7],
];

function Eye({ x, y, color, background }: { x: number; y: number; color: string; background: string }) {
  return (
    <>
      <Rect x={x} y={y} width={7} height={7} rx={2.2} fill={color} />
      <Rect x={x + 1} y={y + 1} width={5} height={5} rx={1.6} fill={background} />
      <Rect x={x + 2} y={y + 2} width={3} height={3} rx={1} fill={color} />
    </>
  );
}

/** Ma trận → MỘT đường Path gồm các chấm tròn (bỏ ba mắt và ô logo). */
function build(value: string) {
  const qr = QRCode.create(value, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size;
  const hole = Math.ceil(n * HOLE) + 2;
  const lo = Math.floor((n - hole) / 2);
  const hi = lo + hole;
  const inEye = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const r0 = 0.42;
  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.modules.get(r, c) || inEye(r, c)) continue;
      if (r >= lo && r < hi && c >= lo && c < hi) continue;
      const cx = c + 0.5;
      const cy = r + 0.5;
      d += `M${cx - r0} ${cy}a${r0} ${r0} 0 1 0 ${r0 * 2} 0a${r0} ${r0} 0 1 0 ${-r0 * 2} 0`;
    }
  }
  return { n, dots: d };
}

const make = () =>
  StyleSheet.create({
    box: { borderRadius: radius.md, overflow: 'hidden' },
    logo: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    logoImg: { overflow: 'hidden' },
  });
