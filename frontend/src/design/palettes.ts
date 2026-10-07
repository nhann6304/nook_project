/**
 * Bảng màu — họ xanh lam pastel, SỐNG THEO TRỜI (07/10/2026).
 *
 * ── Cảnh × màu locket ──────────────────────────────────────────────────
 * Sáu CẢNH nền: sáng · trưa · chiều · tối · mưa · mưa đêm. Chế độ "Theo trời"
 * (mặc định) tự chọn cảnh theo giờ máy, trời mưa thì chuyển sang cảnh mưa
 * (`features/sky`). Chọn cố định "Sáng" = trưa, "Tối" = tối.
 * Năm MÀU LOCKET chỉ đổi sắc nhấn (nút, vòng thân, icon đang chọn) — nền vẫn
 * là của cảnh. 6 × 5 = 30 bảng, dựng MỘT lần lúc nạp module; `useStyles` nhớ
 * theo `key`, đổi bảng chỉ là tra.
 *
 * ── Đậm, không nhạt ────────────────────────────────────────────────────
 * Chữ phụ và sắc nhấn đẩy đậm hơn bản 06/10 ("nhìn nhạt nhoà"). Đo trên `bg`
 * của từng cảnh: chữ ≥ 14:1, chữ mờ ≥ 7.9:1, chữ nhạt ≥ 5.7:1 (≥ 5 trên
 * `surface`), sắc nhấn ≥ 5.3:1 (≥ 4.5 trên `surface`), chữ trên nút ≥ 6:1. `textDisabled` cố ý KHÔNG đạt — chỉ cho nét trang trí.
 *
 * ── Nút chính ──────────────────────────────────────────────────────────
 * Cảnh sáng: nút đặc màu nhấn, chữ TRẮNG. Cảnh tối: nút lam nhạt, chữ tối.
 */

export const SCENES = ['dawn', 'noon', 'dusk', 'night', 'rain', 'rainNight'] as const;
export type Scene = (typeof SCENES)[number];
/** Năm cảnh hiện cho người dùng xem ở Cài đặt (mưa đêm gộp vào mưa). */
export const SKY_SCENES = ['dawn', 'noon', 'dusk', 'night', 'rain'] as const;
export type SkyScene = (typeof SKY_SCENES)[number];

export const ACCENT_KEYS = ['denim', 'rose', 'sage', 'lavender', 'apricot'] as const;
export type AccentKey = (typeof ACCENT_KEYS)[number];

export type ThemeKey = `${Scene}-${AccentKey}`;
type Tone = 'light' | 'dark';

/** Một bảng màu đầy đủ. Thêm khoá ở đây là phải khai ở `build`. */
export type Palette = {
  key: ThemeKey;
  scene: Scene;
  /** Nền sáng — thanh trạng thái phải đổi sang chữ tối. */
  light: boolean;
  /** Vệt trời ở đầu màn chính: [màu trời, màu tan vào nền]. */
  sky: readonly [string, string];

  /* — Nền, xếp từ sâu nhất lên trên — */
  bg: string;
  surfaceSunken: string;
  surface: string;
  surfaceRaised: string;

  /* — Đường kẻ — */
  border: string;
  borderSoft: string;

  /* — "Kính": mặt nổi. Không blur thật (Android vẽ lại mỗi khung hình). — */
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

  /** Nút chính. Ba chặng CÙNG một màu — nút đặc, không dải. */
  gradient: readonly [string, string, string];
  gradientPressed: readonly [string, string, string];

  /** Vòng độ thân, cấp 1 → 10. */
  ring: readonly string[];

  /** Lõi nút chụp. */
  core: string;
  /** Chữ NẰM TRÊN ảnh. Luôn trắng — dưới chữ luôn có lớp `onPhoto` tối. */
  onPhotoText: string;
};

/* ══════════════ CẢNH ══════════════ */

type Base = Pick<
  Palette,
  | 'sky'
  | 'bg'
  | 'surfaceSunken'
  | 'surface'
  | 'surfaceRaised'
  | 'border'
  | 'borderSoft'
  | 'glass'
  | 'glassBorder'
  | 'shadow'
  | 'text'
  | 'textMuted'
  | 'textFaint'
  | 'textDisabled'
> & { tone: Tone };

const SEMANTIC: Readonly<Record<Tone, Pick<Palette, 'honey' | 'mint' | 'violet' | 'danger' | 'core'>>> = {
  light: { honey: '#8A6100', mint: '#1F7556', violet: '#5E44A6', danger: '#B3262E', core: '#FFFFFF' },
  dark: { honey: '#EDCF8C', mint: '#86D6B8', violet: '#C2AEF2', danger: '#F08C8C', core: '#EEF3FB' },
};

const BASES: Readonly<Record<Scene, Base>> = {
  /** Sáng (5–10 giờ): trắng xanh, vệt bình minh hồng đào. */
  dawn: {
    tone: 'light',
    sky: ['#FFD9C2', '#F4F7FF'],
    bg: '#F4F7FF',
    surfaceSunken: '#EAF0FB',
    surface: '#DDE6F7',
    surfaceRaised: '#CAD8F3',
    border: '#C3D2EE',
    borderSoft: '#DCE5F6',
    glass: '#FAFCFF',
    glassBorder: '#FFFFFF',
    shadow: '#18356E',
    text: '#141E36',
    textMuted: '#3A4866',
    textFaint: '#52607E',
    textDisabled: '#A6B3CB',
  },
  /** Trưa (10–16 giờ): trắng + lam xám — đúng bảng "Một vài mẹo nhỏ". */
  noon: {
    tone: 'light',
    sky: ['#C9DCFA', '#FFFFFF'],
    bg: '#FFFFFF',
    surfaceSunken: '#F2F5FB',
    // Đậm hơn bảng gốc #EDF2F8 một nấc: thẻ nhạt quá trên nền trắng là chìm.
    surface: '#E7EDF7',
    surfaceRaised: '#D5E1F4',
    border: '#CDD9EC',
    borderSoft: '#E3EAF5',
    glass: '#F8FAFE',
    glassBorder: '#FFFFFF',
    shadow: '#18356E',
    text: '#141E36',
    textMuted: '#3A4866',
    textFaint: '#52607E',
    textDisabled: '#A9B5CA',
  },
  /** Chiều (16–19 giờ): hoàng hôn hồng tím, nền ấm nhẹ. */
  dusk: {
    tone: 'light',
    sky: ['#F4BDB0', '#F8F2F8'],
    bg: '#F8F2F8',
    surfaceSunken: '#F1E8F2',
    surface: '#E8DCEB',
    surfaceRaised: '#D9C7E1',
    border: '#D3C1DB',
    borderSoft: '#E6DAEB',
    glass: '#FCF8FC',
    glassBorder: '#FFFFFF',
    shadow: '#3B2450',
    text: '#1E1830',
    textMuted: '#463C5C',
    textFaint: '#5E5374',
    textDisabled: '#B6A9C2',
  },
  /** Tối (19–5 giờ): navy. */
  night: {
    tone: 'dark',
    sky: ['#26355F', '#0F1626'],
    bg: '#0F1626',
    surfaceSunken: '#131B2D',
    surface: '#1A2438',
    surfaceRaised: '#243049',
    border: '#33415F',
    borderSoft: '#202B42',
    glass: '#1C273D',
    glassBorder: '#2A3754',
    shadow: '#000000',
    text: '#EEF3FB',
    textMuted: '#B3BFD6',
    textFaint: '#93A2BF',
    textDisabled: '#4A5674',
  },
  /** Mưa ban ngày: xám lam, tối hơn trưa một nấc. */
  rain: {
    tone: 'light',
    sky: ['#AEBCCB', '#EDF1F5'],
    bg: '#EDF1F5',
    surfaceSunken: '#E5EBF0',
    surface: '#DBE3EA',
    surfaceRaised: '#C9D4DF',
    border: '#BAC7D4',
    borderSoft: '#D4DDE6',
    glass: '#F4F7FA',
    glassBorder: '#FFFFFF',
    shadow: '#1E2A3A',
    text: '#162231',
    textMuted: '#3A4A5E',
    textFaint: '#4F5F73',
    textDisabled: '#A3B0BE',
  },
  /** Mưa đêm: đá phiến. */
  rainNight: {
    tone: 'dark',
    sky: ['#2C3949', '#10161E'],
    bg: '#10161E',
    surfaceSunken: '#141B24',
    surface: '#1A232E',
    surfaceRaised: '#24303C',
    border: '#34414F',
    borderSoft: '#1F2934',
    glass: '#1C2530',
    glassBorder: '#2A3542',
    shadow: '#000000',
    text: '#EAF0F5',
    textMuted: '#ADB9C6',
    textFaint: '#8E9BAA',
    textDisabled: '#465363',
  },
};

/* ══════════════ MÀU LOCKET ══════════════ */

/** [nhấn, đậm, sáng, phụ] cho từng tông nền. */
type Swatch = readonly [accent: string, deep: string, bright: string, second: string];

const ACCENTS: Readonly<Record<AccentKey, Readonly<Record<Tone, Swatch>>>> = {
  denim: {
    light: ['#2E549A', '#18356E', '#5B80D8', '#6F8FD9'],
    dark: ['#9AB4EA', '#7A9BE0', '#CCDCFA', '#AAB6CB'],
  },
  rose: {
    light: ['#A3335F', '#7A2045', '#DE7FA3', '#C77B97'],
    dark: ['#F0A8C2', '#D6869F', '#F8D0DE', '#D9B0C0'],
  },
  sage: {
    light: ['#2D6E4D', '#1C4D34', '#5FAE86', '#7FA892'],
    dark: ['#97D3B2', '#72B793', '#C8EAD7', '#A9C4B5'],
  },
  lavender: {
    light: ['#5B42A3', '#3E2B7C', '#937FE0', '#9A8CC4'],
    dark: ['#C0B0F2', '#9E8BDE', '#E0D7FA', '#BDB4D6'],
  },
  apricot: {
    light: ['#A04A16', '#73320C', '#E68A50', '#C58A66'],
    dark: ['#F2B48D', '#DB9264', '#FAD8C2', '#D7B8A4'],
  },
};

/* ══════════════ DỰNG ══════════════ */

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const alpha = (hex: string, a: number) => `rgba(${rgb(hex).join(',')},${a})`;
const mix = (from: string, to: string, k: number) => {
  const a = rgb(from);
  const b = rgb(to);
  return `#${a
    .map((v, i) =>
      Math.round(v + ((b[i] ?? v) - v) * k)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
};

const PHOTO = {
  scrim: 'rgba(15,22,38,0.55)',
  scrimSoft: 'rgba(15,22,38,0.3)',
  onPhoto: 'rgba(15,22,38,0.45)',
  hairlineOnPhoto: 'rgba(255,255,255,0.22)',
  onPhotoText: '#FFFFFF',
} as const;

function build(scene: Scene, key: AccentKey): Palette {
  const { tone, ...base } = BASES[scene];
  const [accent, deep, bright, second] = ACCENTS[key][tone];
  const flat = (x: string) => [x, x, x] as const;
  const light = tone === 'light';
  return {
    ...PHOTO,
    ...SEMANTIC[tone],
    ...base,
    key: `${scene}-${key}`,
    scene,
    light,
    accent,
    accentDeep: deep,
    accentBright: bright,
    accent2: second,
    // Nền sáng: viền kính lấy màu đường kẻ, viền trắng trên nền trắng là chìm mất.
    glassBorder: light ? base.border : base.glassBorder,
    onAccent: light ? '#FFFFFF' : base.bg,
    accentSoft: light ? mix(bright, base.bg, 0.68) : alpha(accent, 0.2),
    glowStrong: alpha(accent, 0.16),
    glowSoft: alpha(accent, 0.1),
    glowFaint: alpha(accent, 0.05),
    glowPink: alpha(second, 0.12),
    gradient: flat(accent),
    gradientPressed: flat(deep),
    ring: Array.from({ length: 10 }, (_, i) => mix(base.textDisabled, accent, (i + 1) / 10)),
  };
}

export const PALETTES: Readonly<Record<ThemeKey, Palette>> = Object.fromEntries(
  SCENES.flatMap((scene) => ACCENT_KEYS.map((k) => [`${scene}-${k}`, build(scene, k)])),
) as Record<ThemeKey, Palette>;

export const paletteOf = (scene: Scene, key: AccentKey): Palette => PALETTES[`${scene}-${key}`];

export const DEFAULT_ACCENT: AccentKey = 'denim';

export function isAccentKey(v: string | null | undefined): v is AccentKey {
  return ACCENT_KEYS.includes(v as AccentKey);
}

/** Cảnh theo giờ máy; trời mưa thì đổi sang cảnh mưa cùng ngày/đêm. */
export function sceneAt(hour: number, raining: boolean): Scene {
  const night = hour < 5 || hour >= 19;
  if (raining) return night ? 'rainNight' : 'rain';
  if (night) return 'night';
  if (hour < 10) return 'dawn';
  if (hour < 16) return 'noon';
  return 'dusk';
}

/** Màu vòng độ thân theo cấp 1–10. Ngoài khoảng thì kẹp về hai đầu. */
export function ringColor(c: Palette, level: number): string {
  const i = Math.min(Math.max(Math.round(level), 1), c.ring.length) - 1;
  return c.ring[i] ?? c.ring[0]!;
}
