/**
 * Dựng icon app + splash từ wordmark LOVO. Chạy lại khi đổi logo:
 *   node scripts/brand-icons.mjs
 * Cần `sharp` (có sẵn ở node_modules gốc của kho, do backend cài).
 * Hình học CHÉP từ src/components/brand/Wordmark.tsx — đổi một bên là đổi cả hai.
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Buffer } from 'node:buffer';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = (f) => path.join(here, '..', 'assets', 'images', f);
const sharp = createRequire(path.join(here, '..', '..', 'package.json'))('sharp');

const NAVY = '#1B263F';
const INK_LIGHT = '#FFFFFF';
const HEART_ON_NAVY = '#8FA7D8';
const HEART_ON_WHITE = '#3C5B91';
const HEART =
  'M98 86C78 72 68 60 68 44C68 32 77 24 87 24C93 24 97 28 98 32C99 28 103 24 109 24C119 24 128 32 128 44C128 60 118 72 98 86Z';

const mark = (ink, heart) => `
  <g fill="none" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 16V84H52" stroke="${ink}"/>
    <path d="${HEART}" stroke="${heart}" fill="${heart}" fill-opacity="0.22"/>
    <path d="M142 16L164 84L186 16" stroke="${ink}"/>
    <circle cx="232" cy="50" r="35" stroke="${ink}"/>
    <circle cx="220" cy="42" r="5.5" fill="${ink}" stroke="none"/>
    <circle cx="244" cy="42" r="5.5" fill="${ink}" stroke="none"/>
    <path d="M217 58Q232 72 247 58" stroke="${heart}" stroke-width="9"/>
  </g>`;

/** Wordmark rộng `share` phần khung, nằm giữa. */
function svg(size, share, ink, heart, bg) {
  const k = (size * share) / 280;
  const x = (size - 280 * k) / 2;
  const y = (size - 100 * k) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="LOVO">
  ${bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : ''}
  <g transform="translate(${x} ${y}) scale(${k})">${mark(ink, heart)}</g>
</svg>
`;
}

const jobs = [
  // iOS bo góc tự, nên nền phủ kín; chữ chiếm 62% bề ngang.
  ['icon', svg(1024, 0.62, INK_LIGHT, HEART_ON_NAVY, NAVY), 1024],
  // Android adaptive: nền là `adaptiveIcon.backgroundColor`, chữ nằm trong vùng an toàn 66%.
  ['icon-foreground', svg(1024, 0.5, INK_LIGHT, HEART_ON_NAVY, null), 1024],
  // Splash nền trắng (app.json) → chữ navy.
  ['splash-icon', svg(400, 0.86, NAVY, HEART_ON_WHITE, null), 400],
];

for (const [name, text, size] of jobs) {
  writeFileSync(out(`${name}.svg`), text);
  await sharp(Buffer.from(text)).resize(size, size).png().toFile(out(`${name}.png`));
  console.log(`ok ${name}.png`);
}
