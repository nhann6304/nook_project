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

/**
 * `photo` = "Theo ảnh" (08/10/2026, mặc định): sắc nhấn lấy từ tấm ảnh gần nhất
 * người dùng gửi, cảnh nền cũng ngả nhẹ theo màu đó — hai người không bao giờ
 * có app giống nhau. Chưa có ảnh nào thì đi như `denim`.
 */
export const ACCENT_KEYS = ['photo', 'denim', 'rose', 'sage', 'lavender', 'apricot'] as const;
export type AccentKey = (typeof ACCENT_KEYS)[number];
type FixedAccent = Exclude<AccentKey, 'photo'>;

/** Màu hạt giống rút từ ảnh — đã làm tròn (hue bước 10°, ba nấc độ đậm) để
 *  số bảng màu có hạn và `useStyles` nhớ được. */
export type Seed = { h: number; s: number };

export type ThemeKey = `${Scene}-${string}`;
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

const SEMANTIC: Readonly<
  Record<Tone, Pick<Palette, 'honey' | 'mint' | 'violet' | 'danger' | 'core'>>
> = {
  light: {
    honey: '#8A6100',
    mint: '#1F7556',
    violet: '#5E44A6',
    danger: '#B3262E',
    core: '#FFFFFF',
  },
  dark: {
    honey: '#EDCF8C',
    mint: '#86D6B8',
    violet: '#C2AEF2',
    danger: '#F08C8C',
    core: '#EEF3FB',
  },
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

const ACCENTS: Readonly<Record<FixedAccent, Readonly<Record<Tone, Swatch>>>> = {
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

/* ── Màu theo ảnh ── */

const hsl = (h: number, sat: number, l: number) => {
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return `#${[f(0), f(8), f(4)]
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
};

const lum = (hex: string) => {
  const [r = 0, g = 0, b = 0] = rgb(hex).map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m) as [number, number];
  return (x + 0.05) / (y + 0.05);
};

/**
 * Bốn sắc từ một hạt giống, ĐO TƯƠNG PHẢN chứ không đoán: nền sáng thì hạ độ
 * sáng tới khi nhấn đạt 5.3:1 trên nền và chữ trắng trên nút đạt 6:1; nền tối
 * thì nâng lên tới khi đạt trên nền tối. Ảnh màu gì cũng ra chữ đọc được.
 */
function seedSwatch({ h, s: sat }: Seed, tone: Tone, base: Base): Swatch {
  if (tone === 'light') {
    let l = 0.46;
    while (
      l > 0.12 &&
      (contrast(hsl(h, sat, l), base.bg) < 5.3 ||
        contrast(hsl(h, sat, l), base.surface) < 4.5 ||
        contrast(hsl(h, sat, l), '#FFFFFF') < 6)
    ) {
      l -= 0.02;
    }
    return [hsl(h, sat, l), hsl(h, sat, l - 0.12), hsl(h, sat, 0.66), hsl(h, sat * 0.5, 0.62)];
  }
  let l = 0.7;
  while (l < 0.95 && contrast(hsl(h, sat, l), base.bg) < 5.3) l += 0.02;
  return [hsl(h, sat, l), hsl(h, sat, l - 0.08), hsl(h, sat, 0.88), hsl(h, sat * 0.35, 0.72)];
}

/** Ngả cả cảnh về màu ảnh — nhẹ thôi (nền 4%, mặt 7%): đủ thấy "app của mình"
 *  mà chữ vẫn giữ tương phản đã đo ở BASES. */
function tintBase(base: Base, { h, s: sat }: Seed): Base {
  const light = base.tone === 'light';
  const hue = hsl(h, Math.max(sat, 0.55), light ? 0.62 : 0.32);
  const t = (x: string, k: number) => mix(x, hue, k);
  return {
    ...base,
    sky: [mix(base.sky[0], hsl(h, 0.6, light ? 0.8 : 0.3), 0.55), t(base.sky[1], 0.04)],
    bg: t(base.bg, 0.04),
    surfaceSunken: t(base.surfaceSunken, 0.06),
    surface: t(base.surface, 0.07),
    surfaceRaised: t(base.surfaceRaised, 0.08),
    border: t(base.border, 0.08),
    borderSoft: t(base.borderSoft, 0.07),
    glass: t(base.glass, 0.04),
  };
}

function build(scene: Scene, key: FixedAccent | Seed): Palette {
  const seeded = typeof key === 'object';
  const { tone, ...base } = seeded ? tintBase(BASES[scene], key) : BASES[scene];
  const [accent, deep, bright, second] = seeded
    ? seedSwatch(key, tone, { tone, ...base })
    : ACCENTS[key][tone];
  const flat = (x: string) => [x, x, x] as const;
  const light = tone === 'light';
  return {
    ...PHOTO,
    ...SEMANTIC[tone],
    ...base,
    key: `${scene}-${seeded ? `h${key.h}s${key.s}` : key}`,
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

const FIXED = ACCENT_KEYS.filter((k): k is FixedAccent => k !== 'photo');

const PALETTES: Readonly<Record<string, Palette>> = Object.fromEntries(
  SCENES.flatMap((scene) => FIXED.map((k) => [`${scene}-${k}`, build(scene, k)])),
);

/** Bảng theo ảnh dựng khi cần rồi nhớ lại — hạt giống đã làm tròn nên có hạn. */
const seeded = new Map<string, Palette>();

export function paletteOf(scene: Scene, key: AccentKey, seed?: Seed | null): Palette {
  if (key !== 'photo') return PALETTES[`${scene}-${key}`]!;
  if (!seed) return PALETTES[`${scene}-denim`]!;
  const id = `${scene}-h${seed.h}s${seed.s}`;
  let p = seeded.get(id);
  if (!p) {
    p = build(scene, seed);
    seeded.set(id, p);
  }
  return p;
}

export const DEFAULT_ACCENT: AccentKey = 'photo';

/** Làm tròn màu thô (hue 0–360, độ đậm 0–1) thành hạt giống. */
export function toSeed(h: number, sat: number): Seed {
  const s = sat < 0.45 ? 0.45 : sat < 0.62 ? 0.6 : 0.72;
  return { h: (Math.round(h / 10) * 10) % 360, s };
}

export function isSeed(v: unknown): v is Seed {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Seed).h === 'number' &&
    typeof (v as Seed).s === 'number'
  );
}

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
