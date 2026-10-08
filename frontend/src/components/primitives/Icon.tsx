/**
 * Icon — nét Phosphor, kiểu DUOTONE (08/10/2026, nhánh thử giao diện).
 *
 * Bộ tự vẽ trước đó bị chê "chưa đủ sức thuyết phục": dày quá thì thô, mảnh quá
 * thì nhạt. Duotone giải cả hai — nét vừa, ruột tô nhạt CÙNG MÀU với nét, nên
 * icon có khối mà không đen, và đổi màu theo nhấn của người dùng.
 *
 * Nét nằm ở `iconPaths.ts`, sinh bằng `node scripts/phosphor-icons.mjs` — thêm
 * icon ở đó. `weight="fill"` cho trạng thái đang chọn (tab đang mở, tim đã thả).
 */
import { memo } from 'react';
import Svg, { Path } from 'react-native-svg';
import { ICON_PATHS } from './iconPaths';

export type IconName = keyof typeof ICON_PATHS;
export type IconWeight = 'duotone' | 'fill' | 'bold';

const SOFT = 0.3;

/** Nét đơn (✓, ×, mũi tên, +): duotone của Phosphor lót thêm ô vuông/tròn mờ
 *  phía sau — đúng cái "ô bao" bị chê. Những icon này luôn đi nét đậm. */
const LINE_ONLY: ReadonlySet<IconName> = new Set([
  'check',
  'close',
  'add',
  'back',
  'forward',
  'up',
  'down',
  'send',
  'more',
]);

export const Icon = memo(function Icon({
  name,
  size = 24,
  color,
  weight = 'duotone',
}: {
  name: IconName;
  size?: number;
  color: string;
  weight?: IconWeight;
}) {
  const p = ICON_PATHS[name];
  // Vẽ to hơn số được hỏi 15% (07/10/2026: "icon nhỏ xíu") — một chỗ thay vì
  // sửa cỡ ở hàng trăm chỗ gọi.
  const px = Math.round(size * 1.15);
  const w = weight === 'duotone' && (!p.soft || LINE_ONLY.has(name)) ? 'bold' : weight;
  return (
    <Svg width={px} height={px} viewBox="0 0 256 256" pointerEvents="none">
      {w === 'duotone' ? (
        <>
          <Path d={p.soft} fill={color} opacity={SOFT} />
          <Path d={p.line} fill={color} />
        </>
      ) : (
        <Path d={w === 'fill' ? p.fill : p.bold} fill={color} />
      )}
    </Svg>
  );
});
