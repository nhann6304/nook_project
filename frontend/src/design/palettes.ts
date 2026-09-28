/**
 * Bảng màu. Người dùng chọn được — mặc định là "Đất nung".
 *
 * ── Vì sao có nhiều bảng ─────────────────────────────────────────────────
 * Nook là app dùng buổi tối, trên giường, trong phòng tối. Cùng một bảng màu
 * không hợp với mọi mắt và mọi thói quen: có người chịu được cam ấm, có người
 * thấy nhức và cần xanh trầm. Cho chọn rẻ hơn nhiều so với đoán.
 *
 * ── Mỗi bảng là một BỘ ĐẦY ĐỦ, không phải đổi mỗi màu nhấn ───────────────
 * Nền, bề mặt, đường kẻ, chữ đều ngả theo sắc của bảng. Chỉ đổi màu nhấn thì
 * cả năm bảng trông y hệt nhau, chỉ khác cái nút.
 *
 * ── Mọi con số ở đây là ĐO, không phải ước lượng ─────────────────────────
 * Tỉ lệ tương phản WCAG 2.1 tính trên chính `bg` của từng bảng. Cả năm bảng
 * đều đạt ở mọi cặp: chữ ≥ 14:1, chữ mờ ≥ 6.8:1, chữ nhạt ≥ 4.8:1, mọi sắc
 * nhấn ≥ 4.8:1, và chữ tối trên dải màu ≥ 5.6:1 ở cả ba chặng.
 *
 * `textDisabled` là ngoại lệ DUY NHẤT và cố ý: khoảng 2.4:1, KHÔNG đạt chuẩn
 * đọc. Nó chỉ dùng cho chữ đã tắt và nét trang trí. Chữ nhỏ nhất mà người ta
 * phải đọc được là `textFaint`.
 *
 * ── Bão hoà đi theo SẮC, không dùng chung một con số ─────────────────────
 * Mắt chịu được cam/đỏ đậm hơn hẳn xanh lá và xanh lơ ở cùng mức bão hoà —
 * cam ở S=0.76 trông ấm, còn xanh lá ở S=0.74 trông như đèn neon. Bản sinh
 * đầu tiên dùng một con số chung và ra đúng lỗi đó. Trần bão hoà theo vùng
 * sắc: cam/hồng 0.72–0.76 · vàng 0.52 · xanh lá 0.40 · lơ 0.46 · lam 0.52 ·
 * tím 0.54.
 *
 * Sinh bằng script rồi chép vào đây, KHÔNG tính lúc chạy: tính lúc chạy là
 * mỗi lần mở app tốn công vô ích cho một kết quả không bao giờ đổi.
 */

/** Một bảng màu đầy đủ. Thêm khoá ở đây là cả năm bảng phải khai. */
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

  /* — Sắc chính — */
  accent: string;
  accent2: string;
  accentBright: string;
  accentDeep: string;
  /** Chữ NẰM TRÊN dải màu. Luôn là màu tối, không bao giờ trắng. */
  onAccent: string;

  /* — Chữ — */
  text: string;
  textMuted: string;
  textFaint: string;
  /** KHÔNG đạt chuẩn đọc. Chỉ cho chữ đã tắt và nét trang trí. */
  textDisabled: string;

  /* — Màu mang nghĩa. Tách hẳn khỏi sắc chính để không ai nhầm
       "màu thương hiệu" với "trạng thái xấu". — */
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

  /* — Dải màu — */
  gradient: readonly [string, string, string];
  gradientPressed: readonly [string, string, string];

  /** Vòng độ thân, cấp 1 → 10. */
  ring: readonly string[];

  /** Lõi nút chụp. */
  core: string;
  /**
   * Chữ NẰM TRÊN ảnh (tên người gửi, caption). Luôn sáng, kể cả ở bảng sáng —
   * ảnh không bao giờ bị nhuộm theo bảng, và dưới chữ luôn có lớp `onPhoto` tối.
   */
  onPhotoText: string;
  /** Vệt trời ở đầu màn chính. `null` = bảng cố định, không có trời. */
  sky: readonly [string, string] | null;
  stars: boolean;
};

type Fixed = Omit<Palette, 'light' | 'core' | 'onPhotoText' | 'sky' | 'stars'>;

/** Năm bảng cố định đều là nền tối: lõi nút chụp và chữ trên ảnh = màu chữ. */
function dark(p: Fixed): Palette {
  return { ...p, light: false, core: p.text, onPhotoText: p.text, sky: null, stars: false };
}

export const PALETTE_KEYS = ['terracotta', 'moss', 'deepsea', 'dusk', 'neutral'] as const;
export type PaletteKey = (typeof PALETTE_KEYS)[number];


/** Đất nung — ấm, mặc định. */
const terracotta = dark({
  key: 'terracotta',

  bg: '#151312',
  surfaceSunken: '#1A1817',
  surface: '#211E1C',
  surfaceRaised: '#2A2624',

  border: '#39332F',
  borderSoft: '#282320',

  accent: '#E8834F', //         6.87:1
  accent2: '#E86E93', //        6.25:1
  accentBright: '#F7A97A', //   9.62:1
  accentDeep: '#C96A38', //     4.94:1
  onAccent: '#1A0E08', // trên dải: 7.95 / 6.33 / 5.91

  text: '#E9E3DC', //          14.54:1
  textMuted: '#A79C93', //      6.90:1
  textFaint: '#8B8179', //      4.86:1
  textDisabled: '#5C5249', //   2.43:1 — KHÔNG đọc được, cố ý

  honey: '#EFC169', //         11.03:1
  mint: '#6FC9A8', //           9.35:1
  violet: '#A98CE0', //         6.63:1
  danger: '#E87B7B', //         6.66:1

  glowStrong: 'rgba(232,131,79,0.1)',
  glowSoft: 'rgba(232,131,79,0.07)',
  glowFaint: 'rgba(232,131,79,0.04)',
  glowPink: 'rgba(232,110,147,0.08)',
  scrim: 'rgba(21,19,18,0.6)',
  scrimSoft: 'rgba(21,19,18,0.35)',
  onPhoto: 'rgba(21,19,18,0.55)',
  hairlineOnPhoto: 'rgba(233,227,220,0.16)',

  gradient: ['#EE9159', '#E8735A', '#DE6A8E'],
  gradientPressed: ['#C96A38', '#C05A48', '#BE5477'],

  ring: ['#8A6A52', '#9A7150', '#AC784E', '#BE7F4D', '#CF864C', '#DD8A50', '#E8834F', '#E8785F', '#E67078', '#E86E93'],
});

/** Rêu — xanh lá trầm. */
const moss = dark({
  key: 'moss',

  bg: '#131614',
  surfaceSunken: '#161918',
  surface: '#1D211F',
  surfaceRaised: '#252A28',

  border: '#313734',
  borderSoft: '#222624',

  accent: '#4EB363', //         6.90:1
  accent2: '#75A635', //        6.30:1
  accentBright: '#7ACE8F', //   9.59:1
  accentDeep: '#50935E', //     4.92:1
  onAccent: '#091E0D', // trên dải: 7.61 / 6.11 / 5.66

  text: '#DBE8E4', //          14.47:1
  textMuted: '#8FA39C', //      6.84:1
  textFaint: '#738A80', //      4.92:1
  textDisabled: '#4A5952', //   2.47:1 — KHÔNG đọc được, cố ý

  honey: '#DDC794', //         10.99:1
  mint: '#7AC9AC', //           9.35:1
  violet: '#B18CDD', //         6.65:1
  danger: '#E57E7E', //         6.61:1

  glowStrong: 'rgba(78,179,99,0.1)',
  glowSoft: 'rgba(78,179,99,0.07)',
  glowFaint: 'rgba(78,179,99,0.04)',
  glowPink: 'rgba(117,166,53,0.08)',
  scrim: 'rgba(19,22,20,0.6)',
  scrimSoft: 'rgba(19,22,20,0.35)',
  onPhoto: 'rgba(19,22,20,0.55)',
  hairlineOnPhoto: 'rgba(219,232,228,0.16)',

  gradient: ['#63BE75', '#54AC40', '#73A038'],
  gradientPressed: ['#4C935A', '#4D883F', '#5F7E37'],

  ring: ['#507A58', '#4E8154', '#4C884E', '#4D8D4A', '#519247', '#569843', '#5C9C40', '#63A03C', '#6CA338', '#75A734'],
});

/** Biển đêm — lam sâu. */
const deepsea = dark({
  key: 'deepsea',

  bg: '#121416',
  surfaceSunken: '#15181A',
  surface: '#1C1F22',
  surfaceRaised: '#24272B',

  border: '#303438',
  borderSoft: '#212327',

  accent: '#5CA8C3', //         6.90:1
  accent2: '#8892D9', //        6.30:1
  accentBright: '#8CC3DC', //   9.63:1
  accentDeep: '#508BA3', //     4.89:1
  onAccent: '#09181E', // trên dải: 7.83 / 6.23 / 5.77

  text: '#E1E4EC', //          14.52:1
  textMuted: '#989EAB', //      6.87:1
  textFaint: '#7C8592', //      4.95:1
  textDisabled: '#4A5159', //   2.30:1 — KHÔNG đọc được, cố ý

  honey: '#DCC691', //         11.02:1
  mint: '#77C8AA', //           9.34:1
  violet: '#B08ADC', //         6.61:1
  danger: '#E47C7C', //         6.57:1

  glowStrong: 'rgba(92,168,195,0.1)',
  glowSoft: 'rgba(92,168,195,0.07)',
  glowFaint: 'rgba(92,168,195,0.04)',
  glowPink: 'rgba(136,146,217,0.08)',
  scrim: 'rgba(18,20,22,0.6)',
  scrimSoft: 'rgba(18,20,22,0.35)',
  onPhoto: 'rgba(18,20,22,0.55)',
  hairlineOnPhoto: 'rgba(225,228,236,0.16)',

  gradient: ['#70B4CC', '#729ACF', '#828DD3'],
  gradientPressed: ['#4B8BA3', '#527CB3', '#626EBA'],

  ring: ['#527581', '#537A8E', '#547E9B', '#5582AA', '#5C86B5', '#6589BE', '#6D8BC7', '#768DCF', '#7E90D6', '#8692DC'],
});

/** Hoàng hôn — tím khói ngả hồng. */
const dusk = dark({
  key: 'dusk',

  bg: '#151316',
  surfaceSunken: '#181619',
  surface: '#201D21',
  surfaceRaised: '#29252A',

  border: '#353137',
  borderSoft: '#252226',

  accent: '#BE8ADC', //         6.91:1
  accent2: '#E76EA1', //        6.28:1
  accentBright: '#D7ABEB', //   9.60:1
  accentDeep: '#A46DC1', //     4.87:1
  onAccent: '#16091E', // trên dải: 8.32 / 6.69 / 6.17

  text: '#EBE1EC', //          14.53:1
  textMuted: '#A999AC', //      6.90:1
  textFaint: '#8E7E93', //      4.89:1
  textDisabled: '#554A59', //   2.21:1 — KHÔNG đọc được, cố ý

  honey: '#DCC691', //         11.02:1
  mint: '#77C8AA', //           9.35:1
  violet: '#B08ADC', //         6.61:1
  danger: '#E47C7C', //         6.57:1

  glowStrong: 'rgba(190,138,220,0.1)',
  glowSoft: 'rgba(190,138,220,0.07)',
  glowFaint: 'rgba(190,138,220,0.04)',
  glowPink: 'rgba(231,110,161,0.08)',
  scrim: 'rgba(21,19,22,0.6)',
  scrimSoft: 'rgba(21,19,22,0.35)',
  onPhoto: 'rgba(21,19,22,0.55)',
  hairlineOnPhoto: 'rgba(235,225,236,0.16)',

  gradient: ['#C799E2', '#DE6FD2', '#E16A9B'],
  gradientPressed: ['#A46CC5', '#C247B5', '#C64179'],

  ring: ['#8B5DA5', '#995DAE', '#A85BB6', '#B858BD', '#C458BE', '#CD5CBA', '#D460B5', '#DB66AF', '#E16AA9', '#E76FA1'],
});

/** Trung tính — gần như không màu. */
const neutral = dark({
  key: 'neutral',

  bg: '#151414',
  surfaceSunken: '#181817',
  surface: '#201F1E',
  surfaceRaised: '#292826',

  border: '#353433',
  borderSoft: '#252423',

  accent: '#BD995D', //         6.90:1
  accent2: '#C48A70', //        6.32:1
  accentBright: '#D3B880', //   9.58:1
  accentDeep: '#9A8151', //     4.93:1
  onAccent: '#1E1609', // trên dải: 7.80 / 6.24 / 5.71

  text: '#E8E4DA', //          14.48:1
  textMuted: '#A49E90', //      6.89:1
  textFaint: '#8A8374', //      4.89:1
  textDisabled: '#59534A', //   2.42:1 — KHÔNG đọc được, cố ý

  honey: '#DCC692', //         10.98:1
  mint: '#77C8AA', //           9.30:1
  violet: '#B18ADC', //         6.60:1
  danger: '#E47E7E', //         6.64:1

  glowStrong: 'rgba(189,153,93,0.1)',
  glowSoft: 'rgba(189,153,93,0.07)',
  glowFaint: 'rgba(189,153,93,0.04)',
  glowPink: 'rgba(196,138,112,0.08)',
  scrim: 'rgba(21,20,20,0.6)',
  scrimSoft: 'rgba(21,20,20,0.35)',
  onPhoto: 'rgba(21,20,20,0.55)',
  hairlineOnPhoto: 'rgba(232,228,218,0.16)',

  gradient: ['#C6A76F', '#BF8F64', '#BE846C'],
  gradientPressed: ['#9C7F4E', '#9B724E', '#9B6851'],

  ring: ['#7D6E54', '#867355', '#8F7555', '#997855', '#A47C55', '#AE7E56', '#B5805B', '#BD8260', '#C48565', '#CA876B'],
});

export const PALETTES: Readonly<Record<PaletteKey, Palette>> = {
  terracotta,
  moss,
  deepsea,
  dusk,
  neutral,
};

export const DEFAULT_PALETTE: PaletteKey = 'terracotta';

export function isPaletteKey(v: string | null | undefined): v is PaletteKey {
  return PALETTE_KEYS.includes(v as PaletteKey);
}

/** Màu vòng độ thân theo cấp 1–10. Ngoài khoảng thì kẹp về hai đầu. */
export function ringColor(c: Palette, level: number): string {
  const i = Math.min(Math.max(Math.round(level), 1), c.ring.length) - 1;
  return c.ring[i] ?? c.ring[0]!;
}

/* ══════════════ MÀU SỐNG THEO TRỜI ══════════════ */

/**
 * Chế độ "Tự động" (bảng thiết kế F1 + 15b): màu app đi theo giờ trong ngày
 * như bầu trời ngoài cửa sổ. Sáng và trưa là nền SÁNG, chiều tối và đêm là nền
 * tối. Ảnh không bao giờ bị nhuộm — chỉ nền, khung, nút đổi.
 *
 * Mốc giờ tính theo đồng hồ máy, không cần vị trí.
 */
export const SKY_KEYS = ['skyDawn', 'skyNoon', 'skyDusk', 'skyNight'] as const;
export type SkyKey = (typeof SKY_KEYS)[number];
export type ThemeKey = PaletteKey | SkyKey;

/** Giờ bắt đầu của từng chặng. Ngoài ba mốc này là đêm. */
export function skyAt(hour: number): SkyKey {
  if (hour >= 5 && hour < 10) return 'skyDawn';
  if (hour >= 10 && hour < 16) return 'skyNoon';
  if (hour >= 16 && hour < 19) return 'skyDusk';
  return 'skyNight';
}

/** Phần dùng chung của hai bảng sáng: lớp phủ trên ảnh vẫn TỐI. */
const LIGHT_PHOTO = {
  scrim: 'rgba(24,16,12,0.55)',
  scrimSoft: 'rgba(24,16,12,0.3)',
  onPhoto: 'rgba(24,16,12,0.5)',
  hairlineOnPhoto: 'rgba(255,255,255,0.22)',
  onPhotoText: '#FFFFFF',
  core: '#FFFFFF',
  light: true,
  stars: false,
} as const;

const skyDawn: Palette = {
  ...LIGHT_PHOTO,
  key: 'skyDawn',
  bg: '#F6EEE6',
  surfaceSunken: '#F1E7DD',
  surface: '#EDE2D7',
  surfaceRaised: '#E4D6C8',
  border: '#D8C7B7',
  borderSoft: '#E6D9CC',
  accent: '#C25E2A',
  accent2: '#C24F74',
  accentBright: '#D9703A',
  accentDeep: '#A64D1F',
  onAccent: '#1A0E08',
  text: '#2A1E18',
  textMuted: '#6E5E52',
  textFaint: '#7A6A5E',
  textDisabled: '#B9A999',
  honey: '#B8860B',
  mint: '#2F8F6B',
  violet: '#7456B8',
  danger: '#B83A3A',
  glowStrong: 'rgba(217,112,58,0.12)',
  glowSoft: 'rgba(217,112,58,0.08)',
  glowFaint: 'rgba(217,112,58,0.05)',
  glowPink: 'rgba(194,79,116,0.08)',
  gradient: ['#D9703A', '#CF5F4A', '#C24F74'],
  gradientPressed: ['#B85C2E', '#AE4F3D', '#A3425F'],
  ring: ['#C9A88E', '#C99F80', '#C99573', '#CA8B65', '#CB8058', '#CC754B', '#C9683F', '#C65F4B', '#C3575F', '#C24F74'],
  sky: ['#F5BF98', '#F7DCC4'],
};

const skyNoon: Palette = {
  ...LIGHT_PHOTO,
  key: 'skyNoon',
  bg: '#FFF8EC',
  surfaceSunken: '#FAF0DF',
  surface: '#F5EAD6',
  surfaceRaised: '#EDDDC2',
  border: '#E0CCAA',
  borderSoft: '#EEE0C8',
  accent: '#B8700F',
  accent2: '#C0563A',
  accentBright: '#D98A1E',
  accentDeep: '#96590A',
  onAccent: '#2B1A05',
  text: '#2B2113',
  textMuted: '#6C5B43',
  textFaint: '#7C6B52',
  textDisabled: '#BFAE92',
  honey: '#A87A0A',
  mint: '#2F8F6B',
  violet: '#7456B8',
  danger: '#B83A3A',
  glowStrong: 'rgba(217,138,30,0.12)',
  glowSoft: 'rgba(217,138,30,0.08)',
  glowFaint: 'rgba(217,138,30,0.05)',
  glowPink: 'rgba(192,86,58,0.08)',
  gradient: ['#D98A1E', '#CC7422', '#C0563A'],
  gradientPressed: ['#B87418', '#AD611C', '#A2482F'],
  ring: ['#CDB48A', '#CCAB78', '#CBA267', '#CA9856', '#C98E45', '#C88434', '#C07826', '#BC6C2C', '#BE6133', '#C0563A'],
  sky: ['#FFE08A', '#FFF0CC'],
};

const skyDusk: Palette = {
  ...terracotta,
  key: 'skyDusk',
  bg: '#1F1518',
  surfaceSunken: '#241A1D',
  surface: '#2E2025',
  surfaceRaised: '#38282E',
  border: '#46343A',
  borderSoft: '#33252A',
  accent: '#EE8A5A',
  text: '#F2E4DE',
  textMuted: '#B39A95',
  textFaint: '#9A827D',
  core: '#F2E4DE',
  onPhotoText: '#F2E4DE',
  scrim: 'rgba(31,21,24,0.6)',
  scrimSoft: 'rgba(31,21,24,0.35)',
  onPhoto: 'rgba(31,21,24,0.55)',
  sky: ['#9A5462', '#5A3039'],
};

const skyNight: Palette = {
  ...terracotta,
  key: 'skyNight',
  sky: ['#1F2238', '#181624'],
  stars: true,
};

export const SKIES: Readonly<Record<SkyKey, Palette>> = { skyDawn, skyNoon, skyDusk, skyNight };
