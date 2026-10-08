/**
 * Chất liệu hạt của VÒNG TAY TÌNH BẠN (08/10/2026) — thay vòng cấp thân 1–10.
 *
 * Mỗi ký ức là một hạt; cấp thân không hiện bằng số mà bằng CHẤT LIỆU hạt và
 * độ dày chuỗi. Hai người nhìn vòng là biết mình đang ở đâu, người ngoài không
 * thấy (luật sản phẩm: cấp thân chỉ hai người trong cặp nhìn thấy).
 *
 * Mỗi chất liệu ba sắc: [thân, ánh, bóng]. Hạt "của tụi mình" (cấp 4–6) lấy màu
 * nhấn của người dùng — vòng đổi theo app của họ.
 */
import type { Palette } from './palettes';

export type BeadTone = readonly [body: string, light: string, shade: string];

export const BEAD_TIERS = ['wood', 'shell', 'ours', 'jade', 'gold'] as const;
export type BeadTier = (typeof BEAD_TIERS)[number];

const FIXED: Readonly<Record<Exclude<BeadTier, 'ours'>, BeadTone>> = {
  wood: ['#B9895E', '#DDB58C', '#8A6140'],
  shell: ['#E9E3EF', '#FFFFFF', '#BDB3C9'],
  jade: ['#4FA889', '#93D9BE', '#2F7A60'],
  gold: ['#E1B54C', '#FBE3A0', '#A8801F'],
};

/** Cấp 1–2 gỗ · 3 vỏ sò · 4–6 màu của mình · 7–8 ngọc · 9–10 vàng. */
export function beadTier(level: number): BeadTier {
  if (level <= 2) return 'wood';
  if (level <= 3) return 'shell';
  if (level <= 6) return 'ours';
  if (level <= 8) return 'jade';
  return 'gold';
}

export function beadTone(c: Palette, tier: BeadTier): BeadTone {
  return tier === 'ours' ? [c.accent2, c.accentBright, c.accent] : FIXED[tier];
}

/** Hạt ngủ đông: xám, không ánh — lâu rồi hai người không có ký ức mới. */
export function sleepingTone(c: Palette): BeadTone {
  return [c.textDisabled, c.borderSoft, c.border];
}

/** Số hạt trên vòng quanh avatar: chuỗi dày dần theo cấp. */
export function beadCount(level: number): number {
  const l = Math.min(Math.max(Math.round(level), 1), 10);
  return 6 + l * 2;
}
