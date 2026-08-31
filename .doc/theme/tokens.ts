/**
 * Nook — design tokens
 * Nguồn sự thật duy nhất cho màu, khoảng cách, chữ.
 * Quy tắc: không bao giờ viết hex trực tiếp trong component. Luôn import từ đây.
 */

export const color = {
  bg: '#0E0D0C',
  surface: '#1A1817',
  surfaceSunken: '#141312',
  border: '#2B2725',

  accent: '#C97B57',
  accentPressed: '#A85F3F',

  text: '#EFE9E3',
  textMuted: '#8A8078',
  textFaint: '#5C5249',

  honey: '#B8912F',
  mint: '#4E8C79',
  danger: '#B5544A',
} as const;

/** Vòng độ thân, cấp 1 → 10. Sáng dần trên nền tối. */
export const friendshipRing = [
  '#3D3330', '#463A33', '#5C4638', '#6E523F', '#85604A',
  '#96694F', '#AE7355', '#BC7A52', '#C97B57', '#D08055',
] as const;

export function ringColor(level: number): string {
  const i = Math.min(Math.max(Math.round(level), 1), 10) - 1;
  return friendshipRing[i];
}

/** Bội số của 4. Đừng dùng số lẻ ngoài thang này. */
export const space = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
} as const;

export const radius = {
  sm: 12, md: 16, lg: 20, xl: 24, frame: 32, full: 999,
} as const;

/**
 * Chỉ hai độ đậm: 400 và 500.
 * maxScale giới hạn phóng chữ để layout không vỡ khi user bật cỡ chữ lớn,
 * nhưng vẫn cho phóng — không bao giờ khoá allowFontScaling.
 */
export const type = {
  title:   { fontSize: 22, fontWeight: '500' as const, maxScale: 1.4 },
  section: { fontSize: 17, fontWeight: '500' as const, maxScale: 1.4 },
  body:    { fontSize: 14, fontWeight: '400' as const, maxScale: 1.6 },
  label:   { fontSize: 12, fontWeight: '400' as const, maxScale: 1.5 },
  faint:   { fontSize: 11, fontWeight: '400' as const, maxScale: 1.5 },
  stat:    { fontSize: 22, fontWeight: '500' as const, maxScale: 1.3 },
} as const;

export const layout = {
  /** Khung ngắm camera = 88% CHIỀU NGANG máy. Không tính theo chiều dọc. */
  cameraFrameRatio: 0.88,
  /** Vùng chạm tối thiểu. Apple khuyến nghị 44pt, Android 48dp. */
  minTouch: 48,
  screenPadding: 16,
} as const;

export const motion = {
  fast: 150,
  base: 220,
  slow: 320,
} as const;
