// Sinh `src/components/primitives/iconPaths.ts` từ bộ MingCute (Apache-2.0,
// mingcute.com) — gói `@iconify-json/mingcute` chỉ là devDependency.
// 08/10/2026: theo Locket — icon KHỐI ĐẶC bo tròn, một màu. Mỗi icon có hai
// kiểu: `fill` (mặc định) và `line` (viền).
// Thêm icon: thêm một dòng vào NAMES rồi chạy `node scripts/icons.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../src/components/primitives/iconPaths.ts');
const set = JSON.parse(
  readFileSync(join(here, '../node_modules/@iconify-json/mingcute/icons.json'), 'utf8'),
);

/** tên trong app → tên MingCute (không kèm -fill / -line) */
const NAMES = {
  home: 'home-4',
  gallery: 'photo-album',
  image: 'pic',
  settings: 'settings-3',
  people: 'group',
  user: 'user-3',
  chat: 'chat-1',
  grid: 'grid',
  history: 'history',
  clear: 'close-circle',
  back: 'left',
  forward: 'right',
  up: 'up',
  down: 'down',
  check: 'check',
  close: 'close',
  add: 'add',
  send: 'arrow-up',
  more: 'more-1',
  camera: 'camera',
  flip: 'refresh-2',
  search: 'search',
  lock: 'lock',
  pin: 'location',
  edit: 'edit-2',
  offline: 'wifi-off',
  at: 'at',
  heart: 'heart',
  laugh: 'emoji',
  fire: 'fire',
  flash: 'flash',
  flashOff: 'flashlight',
  eyeOff: 'eye-close',
  timer: 'stopwatch',
  contrast: 'brightness',
  palette: 'palette',
  music: 'music',
  language: 'translate',
  bell: 'notification',
  logout: 'exit',
  crown: 'vip-1',
  sparkle: 'sparkles',
  sun: 'sun',
  moon: 'moon',
  rain: 'rainstorm',
  gift: 'gift',
  video: 'video',
  download: 'download-2',
  pinTop: 'pin',
  film: 'film',
  link: 'link',
  shield: 'shield',
  qr: 'qrcode',
  share: 'share-2',
  scan: 'scan',
  zoom: 'zoom-in',
};

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

function icon(base, w) {
  const name = `${base}-${w}`;
  const alias = set.aliases?.[name];
  const found =
    set.icons[name] ??
    (alias && Object.keys(alias).length === 1 ? set.icons[alias.parent] : undefined);
  if (!found) throw new Error(`missing mingcute ${name}`);
  return parse(found.body, name);
}

const lines = Object.entries(NAMES).map(
  ([key, base]) =>
    `  ${key}: ${JSON.stringify({ vb: 24, line: icon(base, 'line'), fill: icon(base, 'fill') })},`,
);

writeFileSync(
  out,
  `/* TỆP SINH RA — sửa \`scripts/icons.mjs\` rồi chạy lại, đừng sửa tay.
 * MingCute Icons (Apache-2.0, mingcute.com). */
export type IconNode = readonly [tag: string, attrs: Readonly<Record<string, string | number>>, children?: readonly IconNode[]];
export type IconDef = { vb: number; line: readonly IconNode[]; fill: readonly IconNode[] };

export const ICON_PATHS = {
${lines.join('\n')}
} as const satisfies Record<string, IconDef>;
`,
);
console.log(`wrote ${lines.length} icons`);
