// Chép nét của bộ Phosphor (MIT) vào `src/components/primitives/iconPaths.ts`.
// Gói phosphor-react-native chỉ là devDependency — nhập thẳng thì tsc vấp mã
// trong gói, và gốc gói kéo cả 1500 icon vào bản app.
// Thêm icon: thêm một dòng vào NAMES rồi chạy `node scripts/phosphor-icons.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const defs = join(here, '../node_modules/phosphor-react-native/src/defs');
const out = join(here, '../src/components/primitives/iconPaths.ts');

/** tên trong app → tên Phosphor */
const NAMES = {
  home: 'House',
  gallery: 'Images',
  image: 'Image',
  settings: 'GearSix',
  people: 'UsersThree',
  chat: 'ChatCircleDots',
  grid: 'SquaresFour',
  more: 'DotsThree',
  close: 'X',
  clear: 'XCircle',
  back: 'CaretLeft',
  forward: 'CaretRight',
  up: 'CaretUp',
  down: 'CaretDown',
  check: 'Check',
  add: 'Plus',
  send: 'ArrowUp',
  camera: 'Camera',
  flip: 'CameraRotate',
  search: 'MagnifyingGlass',
  lock: 'Lock',
  pin: 'MapPin',
  edit: 'PencilSimple',
  offline: 'CloudSlash',
  at: 'At',
  heart: 'Heart',
  laugh: 'Smiley',
  fire: 'Fire',
  flash: 'Lightning',
  flashOff: 'LightningSlash',
  eyeOff: 'EyeSlash',
  timer: 'Timer',
  contrast: 'CircleHalf',
  palette: 'Palette',
  music: 'MusicNotes',
  language: 'Globe',
  bell: 'Bell',
  logout: 'SignOut',
  crown: 'Crown',
  sparkle: 'Sparkle',
  sun: 'Sun',
  moon: 'Moon',
  rain: 'CloudRain',
  gift: 'Gift',
  video: 'VideoCamera',
  download: 'DownloadSimple',
  pinTop: 'PushPin',
  film: 'FilmStrip',
  infinity: 'Infinity',
  link: 'LinkSimple',
  shield: 'ShieldCheck',
};

/** Cắt khối của một kiểu nét: từ `'tên',` tới kiểu kế tiếp. */
function block(src, weight) {
  const start = src.indexOf(`'${weight}',`);
  if (start < 0) throw new Error(`no ${weight}`);
  const next = src.indexOf("\n  [\n    '", start);
  return src.slice(start, next < 0 ? undefined : next);
}

const paths = (text) => [...text.matchAll(/<Path\s+d="([^"]+)"([^>]*)\/>/g)];

const lines = [];
for (const [key, name] of Object.entries(NAMES)) {
  const src = readFileSync(join(defs, `${name}.tsx`), 'utf8');
  const duo = paths(block(src, 'duotone'));
  const soft = duo.filter((m) => m[2].includes('duotoneOpacity')).map((m) => m[1]);
  const line = duo.filter((m) => !m[2].includes('duotoneOpacity')).map((m) => m[1]);
  const bold = paths(block(src, 'bold')).map((m) => m[1]);
  const fill = paths(block(src, 'fill')).map((m) => m[1]);
  const j = (a) => JSON.stringify(a.join(' '));
  lines.push(`  ${key}: { soft: ${j(soft)}, line: ${j(line)}, bold: ${j(bold)}, fill: ${j(fill)} },`);
}

writeFileSync(
  out,
  `/* TỆP SINH RA — sửa \`scripts/phosphor-icons.mjs\` rồi chạy lại, đừng sửa tay.
 * Nét lấy từ Phosphor Icons (MIT, phosphoricons.com), lưới 256. */
export const ICON_PATHS = {
${lines.join('\n')}
} as const;
`,
);
console.log(`wrote ${Object.keys(NAMES).length} icons`);
