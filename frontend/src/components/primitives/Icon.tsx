/**
 * Bộ icon RIÊNG của LOVO — vẽ tay trên lưới 24, thay Ionicons (07/10/2026:
 * "icon mảnh, nhìn như app nào cũng có").
 *
 * Một giọng nét cho cả bộ: nét DÀY (2.7), đầu + góc bo tròn, và phần thân tô
 * đậm (`soft`, 30%) để icon có khối, đọc được ngoài nắng. Ba kiểu nét:
 *   stroke — chỉ viền · soft — viền + ruột tô đậm · solid — tô kín (chấm, mắt).
 *
 * Thêm icon: thêm một khoá vào `ICONS`, giữ lưới 24 và độ dày, đừng mượn
 * icon từ bộ khác — lệch giọng là thấy ngay.
 */
import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type Style = 'stroke' | 'soft' | 'solid';
type Part =
  | { d: string; s?: Style }
  | { c: readonly [cx: number, cy: number, r: number]; s?: Style }
  | { r: readonly [x: number, y: number, w: number, h: number, rx: number]; s?: Style };

const STROKE = 2.7;
const SOFT = 0.3;

const ICONS = {
  home: [
    { d: 'M4 10.6 12 4l8 6.6V18.5a2.5 2.5 0 0 1-2.5 2.5H15v-5.2a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 15.8V21H6.5A2.5 2.5 0 0 1 4 18.5z', s: 'soft' },
  ],
  gallery: [
    { d: 'M7.5 3.5h10a3 3 0 0 1 3 3v9.5' },
    { r: [3.5, 7, 14, 13.5, 3], s: 'soft' },
    { d: 'M4 17.5 8 13.5l2.8 2.8 2-2 3.7 3.7' },
    { c: [13.2, 10.8, 1.3], s: 'solid' },
  ],
  image: [
    { r: [3.5, 4.5, 17, 15, 3.5], s: 'soft' },
    { c: [9, 9.5, 1.6], s: 'solid' },
    { d: 'M4 17.5 8.5 13l3 3 2.5-2.5 6 5.5' },
  ],
  settings: [
    { d: 'M4 7.5h8.5M18.5 7.5H20M4 16.5h1.5M11.5 16.5H20' },
    { c: [15.5, 7.5, 2.6], s: 'soft' },
    { c: [8.5, 16.5, 2.6], s: 'soft' },
  ],
  people: [
    { c: [9, 8.5, 3.3], s: 'soft' },
    { d: 'M3.5 19.5c.7-3.3 2.9-5.2 5.5-5.2s4.8 1.9 5.5 5.2' },
    { d: 'M15.6 5.4a3.2 3.2 0 0 1 0 6.2M17.2 14.5c1.9.6 3 2.3 3.3 5' },
  ],
  chat: [
    { d: 'M6 4.5h12A2.5 2.5 0 0 1 20.5 7v8A2.5 2.5 0 0 1 18 17.5h-6l-4.6 3.3v-3.3H6A2.5 2.5 0 0 1 3.5 15V7A2.5 2.5 0 0 1 6 4.5z', s: 'soft' },
    { c: [8.4, 11, 1.2], s: 'solid' },
    { c: [12, 11, 1.2], s: 'solid' },
    { c: [15.6, 11, 1.2], s: 'solid' },
  ],
  grid: [
    { r: [4, 4, 6.5, 6.5, 2.2], s: 'soft' },
    { r: [13.5, 4, 6.5, 6.5, 2.2], s: 'soft' },
    { r: [4, 13.5, 6.5, 6.5, 2.2], s: 'soft' },
    { r: [13.5, 13.5, 6.5, 6.5, 2.2], s: 'soft' },
  ],
  more: [
    { c: [5.5, 12, 1.9], s: 'solid' },
    { c: [12, 12, 1.9], s: 'solid' },
    { c: [18.5, 12, 1.9], s: 'solid' },
  ],
  close: [{ d: 'M6.5 6.5l11 11M17.5 6.5l-11 11' }],
  clear: [{ c: [12, 12, 8.5], s: 'soft' }, { d: 'M9.3 9.3l5.4 5.4M14.7 9.3l-5.4 5.4' }],
  back: [{ d: 'M14.5 5.5 8 12l6.5 6.5' }],
  forward: [{ d: 'M9.5 5.5 16 12l-6.5 6.5' }],
  up: [{ d: 'M5.5 14.5 12 8l6.5 6.5' }],
  down: [{ d: 'M5.5 9.5 12 16l6.5-6.5' }],
  check: [{ d: 'M5 12.5l4.5 4.5L19 7.5' }],
  add: [{ d: 'M12 5v14M5 12h14' }],
  send: [{ d: 'M12 19.5V5.5M6.5 11 12 5.5l5.5 5.5' }],
  camera: [
    { d: 'M3.5 9.2A2.7 2.7 0 0 1 6.2 6.5h1.6l1.5-2.2h5.4l1.5 2.2h1.6a2.7 2.7 0 0 1 2.7 2.7v8.1a2.7 2.7 0 0 1-2.7 2.7H6.2a2.7 2.7 0 0 1-2.7-2.7z', s: 'soft' },
    { c: [12, 13.2, 3.3] },
  ],
  flip: [
    { d: 'M19 10a7 7 0 0 0-12.8-3.4M5.8 3.4v3.8h3.8' },
    { d: 'M5 14a7 7 0 0 0 12.8 3.4M18.2 20.6v-3.8h-3.8' },
  ],
  search: [{ c: [10.8, 10.8, 6.3], s: 'soft' }, { d: 'M15.6 15.6l4.6 4.6' }],
  lock: [
    { r: [4.5, 10.5, 15, 10, 3], s: 'soft' },
    { d: 'M8 10.5V8a4 4 0 0 1 8 0v2.5' },
    { c: [12, 15.5, 1.4], s: 'solid' },
  ],
  pin: [
    { d: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z', s: 'soft' },
    { c: [12, 10, 2.3] },
  ],
  edit: [
    { d: 'M4.5 19.5l.9-3.9L15.6 5.4a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L8.4 18.6z', s: 'soft' },
    { d: 'M13.5 7.5l3 3' },
  ],
  offline: [
    { d: 'M7 18.5h9.5a4 4 0 0 0 .9-7.9A6 6 0 0 0 6.4 9.3 4.6 4.6 0 0 0 7 18.5z', s: 'soft' },
    { d: 'M4 4l16 16' },
  ],
  at: [
    { c: [12, 12, 3.5] },
    { d: 'M15.5 12v1.3a2.6 2.6 0 0 0 5.2 0V12a8.7 8.7 0 1 0-3.5 7' },
  ],
  heart: [
    { d: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z', s: 'soft' },
  ],
  laugh: [
    { c: [12, 12, 8.5], s: 'soft' },
    { c: [9, 10, 1.2], s: 'solid' },
    { c: [15, 10, 1.2], s: 'solid' },
    { d: 'M8.2 13.8a4.2 4.2 0 0 0 7.6 0' },
  ],
  fire: [
    { d: 'M12 21a6 6 0 0 1-6-6c0-3.4 2.6-5.4 3.7-8.5.4 1.8 1.4 3 2.6 3.6.3-2.3 1.2-4.6 3.4-6.1-.4 2.6.6 4.6 1.6 6.1A6.6 6.6 0 0 1 18 15a6 6 0 0 1-6 6z', s: 'soft' },
  ],
  flash: [{ d: 'M13 3 5.5 13.5h6L10.5 21l8-11h-6z', s: 'soft' }],
  flashOff: [{ d: 'M13 3 5.5 13.5h6L10.5 21l8-11h-6z', s: 'soft' }, { d: 'M4 4l16 16' }],
  eyeOff: [
    { d: 'M2.8 12S6 5.8 12 5.8 21.2 12 21.2 12 18 18.2 12 18.2 2.8 12 2.8 12z', s: 'soft' },
    { c: [12, 12, 2.6] },
    { d: 'M4 4l16 16' },
  ],
  timer: [{ c: [12, 13.5, 7.5], s: 'soft' }, { d: 'M12 9.5v4l2.5 1.5M9.5 2.8h5' }],
  contrast: [{ c: [12, 12, 8.5] }, { d: 'M12 3.5a8.5 8.5 0 0 1 0 17z', s: 'solid' }],
  palette: [
    { d: 'M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.9 1.4-1.9-.5-1.2.3-2.4 1.6-2.4h1.7a3.8 3.8 0 0 0 3.8-3.8c0-5-3.9-8.9-8.5-8.9z', s: 'soft' },
    { c: [7.8, 11, 1.25], s: 'solid' },
    { c: [10, 7.4, 1.25], s: 'solid' },
    { c: [14.4, 7.4, 1.25], s: 'solid' },
  ],
  music: [
    { d: 'M9.2 17.5V6.5l10-2.5v11.5' },
    { c: [6.8, 17.6, 2.5], s: 'soft' },
    { c: [16.8, 15.6, 2.5], s: 'soft' },
  ],
  language: [
    { c: [12, 12, 8.5], s: 'soft' },
    { d: 'M3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5s1.1-6.1 3.5-8.5z' },
  ],
  bell: [
    { d: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2H4.5z', s: 'soft' },
    { d: 'M10 20.5a2.2 2.2 0 0 0 4 0' },
  ],
  logout: [
    { d: 'M10 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h3' },
    { d: 'M14.5 8l4 4-4 4M18.5 12H9.5' },
  ],
} as const satisfies Record<string, readonly Part[]>;

export type IconName = keyof typeof ICONS;

export const Icon = memo(function Icon({
  name,
  size = 24,
  color,
}: {
  name: IconName;
  size?: number;
  color: string;
}) {
  // Vẽ to hơn số được hỏi 15% (07/10/2026: "icon nhỏ xíu") — một chỗ thay vì
  // sửa cỡ ở hàng trăm chỗ gọi. Hình vẫn nằm giữa vùng chạm của nút.
  const px = Math.round(size * 1.15);
  return (
    <Svg width={px} height={px} viewBox="0 0 24 24" pointerEvents="none">
      {(ICONS[name] as readonly Part[]).map((p, i) => {
        const s = p.s ?? 'stroke';
        const paint = {
          stroke: s === 'solid' ? undefined : color,
          strokeWidth: STROKE,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
          fill: s === 'stroke' ? 'none' : color,
          fillOpacity: s === 'soft' ? SOFT : 1,
        };
        if ('d' in p) return <Path key={i} d={p.d} {...paint} />;
        if ('c' in p) return <Circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} {...paint} />;
        const [x, y, w, h, rx] = p.r;
        return <Rect key={i} x={x} y={y} width={w} height={h} rx={rx} {...paint} />;
      })}
    </Svg>
  );
});
