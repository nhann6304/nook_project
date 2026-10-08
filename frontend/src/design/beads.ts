/**
 * Chất liệu của VÒNG BẠN BÈ (08/10/2026) — thay vòng cấp thân 1–10.
 *
 * Quanh avatar: vòng DẢI MÀU của chất liệu + MỘT hạt "charm" ở góc dưới phải
 * (bản chuỗi hạt quanh avatar bị chê rối ở cỡ nhỏ). Chuỗi hạt đầy đủ chỉ còn ở
 * trang hai người (`BeadStrand`). Cấp thân nói bằng chất liệu, không bằng số,
 * và chỉ hai người trong cặp thấy.
 *
 * Mỗi chất liệu: [sáng, đậm, ánh]. "Màu riêng" (cấp 4–6) lấy màu nhấn của
 * người dùng — vòng đổi theo app của họ.
 */
import type { Palette } from './palettes';

export type BeadTone = readonly [light: string, deep: string, shine: string];

export const BEAD_TIERS = ['wood', 'shell', 'ours', 'jade', 'gold'] as const;
export type BeadTier = (typeof BEAD_TIERS)[number];

const FIXED: Readonly<Record<Exclude<BeadTier, 'ours'>, BeadTone>> = {
  wood: ['#E2B07A', '#B97A45', '#FFF4E6'],
  shell: ['#F7C6D9', '#B9A7F0', '#FFFFFF'],
  jade: ['#6BE3B0', '#0A9D8A', '#EFFFF8'],
  gold: ['#FFE07A', '#F29A0E', '#FFFBEA'],
};

/** Cấp 1–2 gỗ · 3 vỏ sò · 4–6 màu riêng · 7–8 ngọc · 9–10 vàng. */
export function beadTier(level: number): BeadTier {
  if (level <= 2) return 'wood';
  if (level <= 3) return 'shell';
  if (level <= 6) return 'ours';
  if (level <= 8) return 'jade';
  return 'gold';
}

export function beadTone(c: Palette, tier: BeadTier): BeadTone {
  return tier === 'ours' ? [c.accentBright, c.accent, c.onPhotoText] : FIXED[tier];
}

/** Ngủ đông: xám, không ánh — lâu rồi hai người không có ký ức mới. */
export function sleepingTone(c: Palette): BeadTone {
  return [c.border, c.textDisabled, c.borderSoft];
}
