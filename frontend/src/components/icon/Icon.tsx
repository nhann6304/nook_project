/**
 * Icon — bộ MINGCUTE, khối đặc bo tròn, MỘT màu (08/10/2026, theo Locket).
 *
 * Ba bộ trước đều bị chê (tự vẽ, Phosphor "sơ xài", Solar "AI hoá"). Locket
 * dùng icon khối đặc, mềm, không màu mè — MingCute gần nhất với giọng đó.
 *
 *   fill (mặc định) — khối đặc, cho gần như mọi chỗ
 *   line            — viền, khi cần nhẹ hơn (nằm cạnh một icon đặc khác)
 *
 * Màu icon đi theo chữ: `c.text` / `c.textMuted`, đang chọn thì `c.accent`.
 * Nét sinh vào `iconPaths.ts` bằng `node scripts/icons.mjs` — thêm icon ở đó.
 */
import { memo } from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { ICON_PATHS, type IconNode } from './iconPaths';

export type IconName = keyof typeof ICON_PATHS;
export type IconWeight = 'fill' | 'line';

const TAGS = { path: Path, circle: Circle, rect: Rect, ellipse: Ellipse, g: G } as const;

export const Icon = memo(function Icon({
  name,
  size = 24,
  color,
  weight = 'fill',
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
  const nodes = weight === 'line' ? def.line : def.fill;
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
