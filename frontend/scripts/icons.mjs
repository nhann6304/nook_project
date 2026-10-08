// Sinh `src/components/primitives/iconPaths.ts` từ hai bộ icon (chỉ là devDependency,
// không gói nào vào bản app):
//   · Solar Icons — 480 Design, CC BY 4.0 (github.com/480-Design/Solar-Icon-Set)
//   · Phosphor Icons — MIT, chỉ cho năm dấu nét đơn (✓ × + ↑ ⋯)
// Thêm icon: thêm một dòng vào SOLAR (hoặc GLYPH) rồi chạy `node scripts/icons.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const nm = join(here, '../node_modules');
const out = join(here, '../src/components/primitives/iconPaths.ts');
const solar = JSON.parse(readFileSync(join(nm, '@iconify-json/solar/icons.json'), 'utf8'));

/** tên trong app → [tên Solar, kiểu nét mảnh, kiểu nét đậm] */
const SOLAR = {
  home: ['home-smile'],
  gallery: ['gallery-wide'],
  image: ['gallery'],
  settings: ['settings'],
  people: ['users-group-rounded'],
  chat: ['chat-round-dots'],
  grid: ['widget'],
  clear: ['close-circle'],
  back: ['alt-arrow-left', 'linear', 'bold'],
  forward: ['alt-arrow-right', 'linear', 'bold'],
  up: ['alt-arrow-up', 'linear', 'bold'],
  down: ['alt-arrow-down', 'linear', 'bold'],
  camera: ['camera'],
  flip: ['camera-rotate'],
  search: ['magnifer', 'linear'],
  lock: ['lock-keyhole'],
  pin: ['map-point'],
  edit: ['pen'],
  offline: ['cloud-cross'],
  at: ['mention-circle'],
  heart: ['heart'],
  laugh: ['emoji-funny-circle'],
  fire: ['fire'],
  flash: ['bolt'],
  flashOff: ['bolt-circle'],
  eyeOff: ['eye-closed'],
  timer: ['stopwatch'],
  contrast: ['sun-fog'],
  palette: ['palette'],
  music: ['music-notes'],
  language: ['global'],
  bell: ['bell-bing'],
  logout: ['logout-2'],
  crown: ['crown'],
  sparkle: ['stars'],
  sun: ['sun'],
  moon: ['moon'],
  rain: ['cloud-rain'],
  gift: ['gift'],
  video: ['videocamera'],
  download: ['download-minimalistic'],
  pinTop: ['pin'],
  film: ['clapperboard-play'],
  infinity: ['infinity'],
  link: ['link'],
  shield: ['shield-keyhole'],
};

/** Dấu nét đơn: Solar chỉ có bản bọc vòng tròn — lấy nét đậm Phosphor. */
const GLYPH = { check: 'Check', close: 'X', add: 'Plus', send: 'ArrowUp', more: 'DotsThree' };

const CAMEL = (a) => a.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** Thân SVG → cây [thẻ, thuộc tính, con]. `currentColor` giữ nguyên, lúc vẽ mới thay. */
function parse(body, name) {
  if (/<(mask|defs|clipPath)/.test(body)) throw new Error(`${name}: mask/defs not supported`);
  const root = [];
  const stack = [root];
  for (const m of body.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    const [, close, tag, rawAttrs, self] = m;
    if (close) {
      stack.pop();
      continue;
    }
    const attrs = {};
    for (const a of rawAttrs.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) {
      const v = a[2];
      attrs[CAMEL(a[1])] = /^-?[\d.]+$/.test(v) ? Number(v) : v;
    }
    const node = [tag, attrs];
    stack[stack.length - 1].push(node);
    if (!self) {
      node.push([]);
      stack.push(node[2]);
    }
  }
  return root;
}

function solarIcon(base, w) {
  const name = `${base}-${w}`;
  // Bí danh không kèm lật/xoay thì trỏ thẳng về icon gốc.
  const alias = solar.aliases?.[name];
  const icon =
    solar.icons[name] ??
    (alias && Object.keys(alias).length === 1 ? solar.icons[alias.parent] : undefined);
  if (!icon) throw new Error(`missing solar ${name}`);
  return parse(icon.body, name);
}

function phosphor(name, weight) {
  const src = readFileSync(join(nm, `phosphor-react-native/src/defs/${name}.tsx`), 'utf8');
  const start = src.indexOf(`'${weight}',`);
  const end = src.indexOf("\n  [\n    '", start);
  const d = [...src.slice(start, end < 0 ? undefined : end).matchAll(/<Path\s+d="([^"]+)"/g)].map(
    (m) => m[1],
  );
  return d.map((x) => ['path', { d: x, fill: 'currentColor' }]);
}

const lines = [];
for (const [key, [base, thin = 'line-duotone', bold = 'bold-duotone']] of Object.entries(SOLAR)) {
  const v = { vb: 24, line: solarIcon(base, thin), bold: solarIcon(base, bold) };
  lines.push(`  ${key}: ${JSON.stringify(v)},`);
}
for (const [key, name] of Object.entries(GLYPH)) {
  const v = { vb: 256, line: phosphor(name, 'bold'), bold: phosphor(name, 'bold') };
  lines.push(`  ${key}: ${JSON.stringify(v)},`);
}

writeFileSync(
  out,
  `/* TỆP SINH RA — sửa \`scripts/icons.mjs\` rồi chạy lại, đừng sửa tay.
 * Solar Icons © 480 Design (CC BY 4.0) · Phosphor Icons (MIT). */
export type IconNode = readonly [tag: string, attrs: Readonly<Record<string, string | number>>, children?: readonly IconNode[]];
export type IconDef = { vb: number; line: readonly IconNode[]; bold: readonly IconNode[] };

export const ICON_PATHS = {
${lines.join('\n')}
} as const satisfies Record<string, IconDef>;
`,
);
console.log(`wrote ${lines.length} icons`);
