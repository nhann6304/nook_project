/**
 * Icon — bộ SOLAR (08/10/2026, nhánh thử giao diện).
 *
 * Hai bộ trước đều bị chê: tự vẽ thì "chưa thuyết phục", Phosphor thì "sơ xài"
 * (khiên Riêng tư chỉ là một cái viền). Solar có chi tiết thật (khiên có lỗ
 * khoá, camera có ống kính + đèn) và hai tông sẵn: phần phụ mờ 50%, phần chính
 * đậm — rõ mà không nặng.
 *
 *   duotone (mặc định) — nét mảnh hai tông, cho thanh công cụ, nút thao tác
 *   fill / bold        — khối đặc hai tông, cho thứ đang chọn và icon đứng một
 *                        mình (hàng cài đặt, tab đang mở)
 *
 * Nét sinh vào `iconPaths.ts` bằng `node scripts/icons.mjs` — thêm icon ở đó.
 */
import { memo } from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { ICON_PATHS, type IconNode } from './iconPaths';

export type IconName = keyof typeof ICON_PATHS;
export type IconWeight = 'duotone' | 'fill' | 'bold';

const TAGS = { path: Path, circle: Circle, rect: Rect, ellipse: Ellipse, g: G } as const;

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
  const def = ICON_PATHS[name];
  // Vẽ to hơn số được hỏi 15% (07/10/2026: "icon nhỏ xíu") — một chỗ thay vì
  // sửa cỡ ở hàng trăm chỗ gọi.
  const px = Math.round(size * 1.15);
  const nodes = weight === 'duotone' ? def.line : def.bold;
  return (
    <Svg width={px} height={px} viewBox={`0 0 ${def.vb} ${def.vb}`} pointerEvents="none">
      {nodes.map((n, i) => draw(n, i, color))}
    </Svg>
  );
});

function draw([tag, attrs, children]: IconNode, key: number, color: string): React.ReactNode {
  const Tag = TAGS[tag as keyof typeof TAGS];
  if (!Tag) return null;
  const props: Record<string, string | number> = {};
  for (const k in attrs) {
    const v = attrs[k]!;
    props[k] = v === 'currentColor' ? color : v;
  }
  return (
    <Tag key={key} {...props}>
      {children?.map((c, i) => draw(c, i, color))}
    </Tag>
  );
}
