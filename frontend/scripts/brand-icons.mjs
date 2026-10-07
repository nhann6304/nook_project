/**
 * Dựng icon app + splash từ logo LOVO (bản 07/10/2026: chữ phồng trắng, tim
 * kính phát sáng, chữ "o" cuối là mặt cười). Chạy lại khi đổi logo:
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

/* Hình học trên viewBox 300×130 — giống hệt Wordmark.tsx. */
const VB_W = 300;
const VB_H = 130;
const L = 'M34 28V92H70';
const V = 'M168 50L186 94L204 50';
const HEART =
  'M117 101C93 86 82 72 82 56C82 42 92 33 104 33C110 33 115 37 117 42C119 37 124 33 130 33C142 33 152 42 152 56C152 72 141 86 117 101Z';
const O = { cx: 254, cy: 70, r: 33 };
const SMILE = 'M240 76Q254 90 268 76';

const defs = `
  <defs>
    <linearGradient id="puff" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#DCE3EE"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5A6A8E"/>
      <stop offset="1" stop-color="#1D2740"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
  </defs>`;

/** Chữ phồng + tim kính. `ink` = màu chữ, `eye` = màu mắt/miệng khoét trên chữ o. */
const mark = (ink, eye) => `
  <g filter="url(#shadow)">
    <path d="${L}" stroke="${ink}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="${V}" stroke="${ink}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="${O.cx}" cy="${O.cy}" r="${O.r}" fill="${ink}"/>
  </g>
  <circle cx="${O.cx - 11}" cy="${O.cy - 7}" r="4.6" fill="${eye}"/>
  <circle cx="${O.cx + 11}" cy="${O.cy - 7}" r="4.6" fill="${eye}"/>
  <path d="${SMILE}" stroke="${eye}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="${HEART}" fill="url(#glass)"/>
  <path d="${HEART}" stroke="#BFD3FF" stroke-width="8" fill="none" filter="url(#glow)" opacity="0.9"/>
  <path d="${HEART}" stroke="#F2F6FF" stroke-width="3.2" fill="none" stroke-linejoin="round"/>`;

function svg(size, share, { bg, ink, eye }) {
  const k = (size * share) / VB_W;
  const x = (size - VB_W * k) / 2;
  const y = (size - VB_H * k) / 2;
  const back = bg
    ? `<radialGradient id="bg" cx="0.78" cy="0.18" r="1.1">
        <stop offset="0" stop-color="#4A5878"/>
        <stop offset="0.55" stop-color="#252F47"/>
        <stop offset="1" stop-color="#161D2E"/>
      </radialGradient>
      <rect width="${size}" height="${size}" fill="url(#bg)"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="LOVO">
  ${defs}
  ${back}
  <g transform="translate(${x} ${y}) scale(${k})">${mark(ink, eye)}</g>
</svg>
`;
}

const ON_NAVY = { bg: true, ink: 'url(#puff)', eye: '#1D2740' };

const jobs = [
  // iOS bo góc tự, nên nền phủ kín; chữ chiếm 70% bề ngang.
  ['icon', svg(1024, 0.7, ON_NAVY), 1024],
  // Android adaptive: nền là `adaptiveIcon.backgroundColor`, chữ trong vùng an toàn 66%.
  ['icon-foreground', svg(1024, 0.56, { ...ON_NAVY, bg: false }), 1024],
  // Splash nền navy (app.json) — cùng một hình với icon.
  ['splash-icon', svg(400, 0.9, { ...ON_NAVY, bg: false }), 400],
];

for (const [name, text, size] of jobs) {
  writeFileSync(out(`${name}.svg`), text);
  await sharp(Buffer.from(text)).resize(size, size).png().toFile(out(`${name}.png`));
  console.log(`ok ${name}.png`);
}
