import { Logger } from '@nestjs/common';
import sharp from 'sharp';

/**
 * Logo LOVO NHÁY MẮT cho đầu thư — ảnh GIF động, dựng MỘT lần lúc gửi thư
 * đầu tiên rồi giữ trong bộ nhớ.
 *
 * GIF chứ không SVG/CSS: Gmail gỡ sạch SVG và animation CSS, còn GIF động thì
 * chạy ở gần như mọi hộp thư. Outlook bản máy tính chỉ hiện khung ĐẦU — nên
 * khung đầu là mắt mở. Nền navy nướng sẵn vào ảnh (GIF không có viền mờ).
 *
 * Hình học CHÉP từ frontend `Wordmark.tsx` / `scripts/brand-icons.mjs` —
 * đổi logo thì đổi cả ba.
 */
const VB_W = 300;
const VB_H = 130;
const PAD = 14;
const SCALE = 2;
/** Cỡ HIỆN trong thư; ảnh thật gấp đôi để màn nét. */
const SHOW_W = 168;
export const MAIL_LOGO = {
  width: SHOW_W,
  height: Math.round((SHOW_W * (VB_H + PAD * 2)) / (VB_W + PAD * 2)),
} as const;

const L = 'M34 28V92H70';
const V = 'M168 50L186 94L204 50';
const HEART =
  'M117 101C93 86 82 72 82 56C82 42 92 33 104 33C110 33 115 37 117 42C119 37 124 33 130 33C142 33 152 42 152 56C152 72 141 86 117 101Z';
const O = { cx: 254, cy: 70, r: 33 } as const;
const SMILE = 'M240 76Q254 90 268 76';
const EYE = { r: 4.6, dx: 11, dy: 7 } as const;
const NAVY = '#1D2740';

/** Một khung: `l`/`r` là độ mở của từng mắt (1 mở · 0.12 nhắm), `glow` là độ sáng tim. */
function frame(l: number, r: number, glow: number): Buffer {
  const w = (VB_W + PAD * 2) * SCALE;
  const h = (VB_H + PAD * 2) * SCALE;
  const eye = (cx: number, open: number) =>
    `<ellipse cx="${cx}" cy="${O.cy - EYE.dy}" rx="${EYE.r}" ry="${EYE.r * open}" fill="${NAVY}"/>`;
  const line = `stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="puff" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCE3EE"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5A6A8E"/><stop offset="1" stop-color="${NAVY}"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="${NAVY}"/>
  <g transform="scale(${SCALE}) translate(${PAD} ${PAD})">
    <path d="${L}" stroke="#000" opacity="0.25" transform="translate(0 4)" ${line}/>
    <path d="${V}" stroke="#000" opacity="0.25" transform="translate(0 4)" ${line}/>
    <circle cx="${O.cx}" cy="${O.cy + 4}" r="${O.r}" fill="#000" opacity="0.25"/>
    <path d="${L}" stroke="url(#puff)" ${line}/>
    <path d="${V}" stroke="url(#puff)" ${line}/>
    <circle cx="${O.cx}" cy="${O.cy}" r="${O.r}" fill="url(#puff)"/>
    ${eye(O.cx - EYE.dx, l)}${eye(O.cx + EYE.dx, r)}
    <path d="${SMILE}" stroke="${NAVY}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="${HEART}" fill="url(#glass)"/>
    <path d="${HEART}" stroke="#BFD3FF" stroke-width="${8 + glow * 6}" fill="none" filter="url(#glow)" opacity="${0.75 + glow * 0.25}"/>
    <path d="${HEART}" stroke="#F2F6FF" stroke-width="3.2" fill="none" stroke-linejoin="round"/>
  </g>
</svg>`);
}

/**
 * Nhịp giống `blink="loop"` trên app: nháy một mắt chào (tim sáng lên theo),
 * nghỉ, chớp đôi, nghỉ — lặp mãi.
 */
const TIMELINE: readonly (readonly [l: number, r: number, glow: number, ms: number])[] = [
  [1, 1, 0, 1400],
  [1, 0.12, 1, 380],
  [1, 1, 0.5, 160],
  [1, 1, 0, 2600],
  [0.12, 0.12, 0, 100],
  [1, 1, 0, 130],
  [0.12, 0.12, 0, 100],
  [1, 1, 0, 2200],
];

const log = new Logger('MailLogo');
let cached: Promise<Buffer | null> | null = null;

/** GIF động; `null` khi dựng hỏng — thư vẫn đi, chỉ thiếu logo. */
export function mailLogo(): Promise<Buffer | null> {
  cached ??= build().catch((e: unknown) => {
    log.warn(`logo render failed, mail goes without it: ${String(e)}`);
    return null;
  });
  return cached;
}

async function build(): Promise<Buffer> {
  const frames = await Promise.all(
    TIMELINE.map(([l, r, glow]) =>
      sharp(frame(l, r, glow))
        .resize(MAIL_LOGO.width * SCALE)
        .png()
        .toBuffer(),
    ),
  );
  return sharp(frames, { join: { animated: true } })
    .gif({ delay: TIMELINE.map((f) => f[3]), loop: 0, effort: 10 })
    .toBuffer();
}
