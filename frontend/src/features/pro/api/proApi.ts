/**
 * LOVO Pro — HÀNG GIẢ (08/10/2026, nhánh thử giao diện).
 *
 * Giá thật sẽ đọc từ App Store / Google Play lúc chạy (mỗi nước một giá, store
 * ăn 15–30%), không gõ cứng. Đây chỉ là con số để vẽ màn hình.
 *
 * Luật không đổi (`.docs/01-product-system.md` mục 7): KHÔNG BAO GIỜ bán chỗ
 * bạn bè, cấp thân, ký ức. Ảnh chất lượng gốc là của MỌI người, không riêng Pro.
 */
export type ProPlan = { id: 'month' | 'year'; price: number; perMonth: number };

export const PRO_PLANS: readonly ProPlan[] = [
  { id: 'month', price: 20_000, perMonth: 20_000 },
  { id: 'year', price: 199_000, perMonth: Math.round(199_000 / 12) },
];

export const TRIAL_DAYS = 7;

/**
 * Chưa có cửa thanh toán (cần development build + StoreKit / Play Billing) —
 * luôn trả `false` để màn báo "sắp có".
 */
export async function startTrial(plan: ProPlan['id']): Promise<boolean> {
  void plan;
  return false;
}
