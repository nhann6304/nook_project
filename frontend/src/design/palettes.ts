/**
 * Bảng màu — họ xanh lam pastel (bảng thiết kế 06/10/2026, thay đất nung +
 * màu theo trời). Hai NỀN (sáng / tối) × năm MÀU LOCKET = mười bảng.
 *
 * ── Nền và màu locket tách nhau ─────────────────────────────────────────
 * Nền, bề mặt, đường kẻ, chữ đi theo `Tone` — luôn ngả lam, kể cả khi người
 * dùng chọn locket hồng. Màu locket chỉ đổi sắc nhấn: nút, vòng thân, viền ảnh.
 * Đổi cả nền theo locket thì năm lựa chọn thành năm app khác nhau.
 *
 * ── Nút chính: sáng thì chữ TRẮNG, tối thì chữ TỐI ──────────────────────
 * Nền sáng dùng nút denim đặc (#3C5B91, trắng trên đó 6.9:1). Nền tối dùng nút
 * lam nhạt, chữ navy. Luật cũ "chữ trên nút luôn tối" là cho dải cam — hết áp.
 *
 * ── Đo, không ước ───────────────────────────────────────────────────────
 * Trên `bg` của từng nền: chữ ≥ 15:1, chữ mờ ≥ 7.1:1, chữ nhạt ≥ 5.2:1 (≥ 4.6
 * trên `surface`), sắc nhấn ≥ 5.4:1 (≥ 4.8 trên `surface`), chữ trên nút ≥ 5.4:1. `textDisabled` cố ý KHÔNG đạt (~2:1) — chỉ
 * cho chữ đã tắt và nét trang trí.
 *
 * Mười bảng dựng MỘT lần lúc nạp module (vòng thân nội suy, lớp phủ ghép alpha),
 * không dựng lại khi vẽ: `useStyles` nhớ theo `key`, đổi bảng chỉ là tra.
 */

export const TONES = ['light', 'dark'] as const;
export type Tone = (typeof TONES)[number];

export const ACCENT_KEYS = ['denim', 'rose', 'sage', 'lavender', 'apricot'] as const;
export type AccentKey = (typeof ACCENT_KEYS)[number];

export type ThemeKey = `${Tone}-${AccentKey}`;

/** Một bảng màu đầy đủ. Thêm khoá ở đây là phải khai ở `build`. */
export type Palette = {
  key: ThemeKey;
  /** Nền sáng — thanh trạng thái phải đổi sang chữ tối. */
  light: boolean;

  /* — Nền, xếp từ sâu nhất lên trên — */
  bg: string;
  surfaceSunken: string;
  surface: string;
  surfaceRaised: string;

  /* — Đường kẻ — */
  border: string;
  borderSoft: string;

  /* — "Kính" — mặt nổi (thanh tab, nút tròn trên camera). Không blur thật:
       blur trên Android vẽ lại mỗi khung hình. Nền gần trong + viền sáng +
       bóng mềm cho cùng cảm giác mà không tốn gì. — */
  glass: string;
  glassBorder: string;
  /** Màu bóng đổ của mặt nổi. */
  shadow: string;

  /* — Sắc chính (màu locket) — */
  accent: string;
  accent2: string;
  accentBright: string;
  accentDeep: string;
  /** Chữ NẰM TRÊN nút chính. */
  onAccent: string;
  /** Nền tròn sau icon (hàng cài đặt, tab đang chọn). */
  accentSoft: string;

  /* — Chữ — */
  text: string;
  textMuted: string;
  textFaint: string;
  /** KHÔNG đạt chuẩn đọc. Chỉ cho chữ đã tắt và nét trang trí. */
  textDisabled: string;

  /* — Màu mang nghĩa — tách khỏi sắc chính để không nhầm với trạng thái xấu. */
  honey: string;
  mint: string;
  violet: string;
  danger: string;

  /* — Lớp phủ trong suốt — */
  glowStrong: string;
  glowSoft: string;
  glowFaint: string;
  glowPink: string;
  scrim: string;
  scrimSoft: string;
  onPhoto: string;
  hairlineOnPhoto: string;

  /** Nút chính. Ba chặng CÙNG một màu — nút đặc, không dải (đỡ "AI"). */
  gradient: readonly [string, string, string];
  gradientPressed: readonly [string, string, string];

  /** Vòng độ thân, cấp 1 → 10. */
  ring: readonly string[];

  /** Lõi nút chụp. */
  core: string;
  /** Chữ NẰM TRÊN ảnh. Luôn trắng — dưới chữ luôn có lớp `onPhoto` tối. */
  onPhotoText: string;
};

/* ══════════════ NỀN ══════════════ */

type Base = Omit<
  Palette,
  | 'key'
  | 'accent'
  | 'accent2'
  | 'accentBright'
  | 'accentDeep'
  | 'onAccent'
  | 'accentSoft'
  | 'glowStrong'
  | 'glowSoft'
  | 'glowFaint'
  | 'glowPink'
  | 'gradient'
  | 'gradientPressed'
  | 'ring'
>;

const PHOTO = {
  scrim: 'rgba(15,22,38,0.55)',
  scrimSoft: 'rgba(15,22,38,0.3)',
  onPhoto: 'rgba(15,22,38,0.45)',
  hairlineOnPhoto: 'rgba(255,255,255,0.22)',
  onPhotoText: '#FFFFFF',
} as const;

const BASES: Readonly<Record<Tone, Base>> = {
  /** Trắng + lam xám — đúng bảng "Một vài mẹo nhỏ". */
  light: {
    ...PHOTO,
    light: true,
    bg: '#FFFFFF',
    surfaceSunken: '#F5F8FC',
    surface: '#EDF2F8', //         nền ô mẹo
    surfaceRaised: '#DCE7F7', //   nền icon tròn
    border: '#D2DDEE',
    borderSoft: '#E5ECF6',
    glass: '#F8FAFE',
    glassBorder: '#FFFFFF',
    shadow: '#18356E',
    text: '#1B263F', //           15.1:1
    textMuted: '#4A5874', //       7.1:1
    textFaint: '#5F6C88', //       5.3:1
    textDisabled: '#AAB6CB', //    2.1:1 — KHÔNG đọc được, cố ý
    honey: '#966A05',
    mint: '#2B7F60',
    violet: '#6A4FB0',
    danger: '#B23A3A',
    core: '#FFFFFF',
  },
  /** Navy — màn chào "Gặp gỡ những khoảnh khắc đặc biệt". */
  dark: {
    ...PHOTO,
    light: false,
    bg: '#0F1626',
    surfaceSunken: '#131B2D',
    surface: '#1A2438',
    surfaceRaised: '#232F47',
    border: '#2F3C58',
    borderSoft: '#1F2A40',
    glass: '#1C273D',
    glassBorder: 'rgba(255,255,255,0.08)',
    shadow: '#000000',
    text: '#E9EEF8', //           15.5:1
    textMuted: '#A6B2C9', //       8.5:1
    textFaint: '#8392AE', //       5.8:1
    textDisabled: '#465370', //    2.1:1 — KHÔNG đọc được, cố ý
    honey: '#E3C98F',
    mint: '#7FCDB0',
    violet: '#B9A4EA',
    danger: '#EC8A8A',
    core: '#E9EEF8',
  },
};

/* ══════════════ MÀU LOCKET ══════════════ */

/** [nhấn, đậm, sáng, phụ] cho từng nền. */
type Swatch = readonly [accent: string, deep: string, bright: string, second: string];

const ACCENTS: Readonly<Record<AccentKey, Readonly<Record<Tone, Swatch>>>> = {
  denim: {
    light: ['#3C5B91', '#18356E', '#6F8FD9', '#728CC3'],
    dark: ['#8FA7D8', '#6F8FD9', '#C9DAF9', '#AAB6CB'],
  },
  rose: {
    light: ['#A3466B', '#7A2E4D', '#D98AA8', '#C77B97'],
    dark: ['#E5A3BB', '#C9809B', '#F5CCDA', '#D9B0C0'],
  },
  sage: {
    light: ['#3B7558', '#24533C', '#74B393', '#7FA892'],
    dark: ['#91C9AB', '#6FAE8E', '#C4E6D3', '#A9C4B5'],
  },
  lavender: {
    light: ['#634FA0', '#44337A', '#9C8BDB', '#9A8CC4'],
    dark: ['#B7A8E8', '#9887D6', '#DCD3F7', '#BDB4D6'],
  },
  apricot: {
    light: ['#9C5326', '#713814', '#E0915E', '#C58A66'],
    dark: ['#EDB08A', '#D98F63', '#F8D5BE', '#D7B8A4'],
  },
};

/* ══════════════ DỰNG ══════════════ */

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const alpha = (hex: string, a: number) => `rgba(${rgb(hex).join(',')},${a})`;
const mix = (from: string, to: string, k: number) => {
  const a = rgb(from);
  const b = rgb(to);
  return `#${a
    .map((v, i) => Math.round(v + ((b[i] ?? v) - v) * k).toString(16).padStart(2, '0'))
    .join('')}`;
};

function build(tone: Tone, key: AccentKey): Palette {
  const base = BASES[tone];
  const [accent, deep, bright, second] = ACCENTS[key][tone];
  const flat = (x: string) => [x, x, x] as const;
  return {
    ...base,
    key: `${tone}-${key}`,
    accent,
    accentDeep: deep,
    accentBright: bright,
    accent2: second,
    onAccent: tone === 'light' ? '#FFFFFF' : base.bg,
    accentSoft: tone === 'light' ? mix(bright, '#FFFFFF', 0.72) : alpha(accent, 0.16),
    glowStrong: alpha(accent, 0.14),
    glowSoft: alpha(accent, 0.09),
    glowFaint: alpha(accent, 0.05),
    glowPink: alpha(second, 0.1),
    gradient: flat(accent),
    gradientPressed: flat(deep),
    ring: Array.from({ length: 10 }, (_, i) => mix(base.textDisabled, accent, (i + 1) / 10)),
  };
}

export const PALETTES: Readonly<Record<ThemeKey, Palette>> = Object.fromEntries(
  TONES.flatMap((tone) => ACCENT_KEYS.map((k) => [`${tone}-${k}`, build(tone, k)])),
) as Record<ThemeKey, Palette>;

export const paletteOf = (tone: Tone, key: AccentKey): Palette => PALETTES[`${tone}-${key}`];

export const DEFAULT_ACCENT: AccentKey = 'denim';

export function isAccentKey(v: string | null | undefined): v is AccentKey {
  return ACCENT_KEYS.includes(v as AccentKey);
}

/** Màu vòng độ thân theo cấp 1–10. Ngoài khoảng thì kẹp về hai đầu. */
export function ringColor(c: Palette, level: number): string {
  const i = Math.min(Math.max(Math.round(level), 1), c.ring.length) - 1;
  return c.ring[i] ?? c.ring[0]!;
}
