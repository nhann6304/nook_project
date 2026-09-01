/**
 * Nhận dạng người dùng khi đăng nhập.
 * Một chỗ duy nhất cho luật kiểm và chuẩn hoá email / số điện thoại, để màn
 * Đăng nhập và màn Nhập mã không mỗi nơi tự chế một luật rồi lệch nhau.
 */

export type SignInMethod = 'email' | 'phone';

/** Đủ chặt để chặn lỗi gõ, không chặt tới mức loại nhầm email hợp lệ. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function isEmail(v: string): boolean {
  return EMAIL.test(v.trim());
}

/**
 * Về dạng 9 chữ số của số trong nước: 0912345678 → 912345678.
 *
 * Thứ tự hai bước dưới đây KHÔNG đảo được. Bỏ số 0 đầu TRƯỚC, rồi mới xét "84":
 * số 084xxxxxxx là số thật, bỏ 0 xong còn "84xxxxxxx" — nếu cắt "84" trước thì
 * cắt nhầm vào chính đầu số của người ta.
 */
export function phoneDigits(v: string): string {
  let d = v.replace(/\D/g, '').replace(/^0+/, '');
  if (d.length > 9 && d.startsWith('84')) d = d.slice(2); // dán từ danh bạ dạng +84…
  return d.slice(0, 9);
}

/** Đầu số di động Việt Nam sau khi bỏ số 0: 3, 5, 7, 8, 9. */
export function isVnPhone(v: string): boolean {
  return /^[35789]\d{8}$/.test(phoneDigits(v));
}

/** 912345678 → "912 345 678". Nhóm ba để người gõ soi lại được số của mình. */
export function formatVnPhone(v: string): string {
  const d = phoneDigits(v);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' ');
}

/** Dạng gửi cho backend. */
export function toE164(v: string): string {
  return `+84${phoneDigits(v)}`;
}

/** Dạng đọc được, hiện lại trên màn Nhập mã để người ta soát trước khi chờ mã. */
export function displayTarget(method: SignInMethod, value: string): string {
  return method === 'email' ? value.trim() : `+84 ${formatVnPhone(value)}`;
}

/** Ô nhập đã đủ hợp lệ để bật nút Tiếp tục chưa. */
export function isValidTarget(method: SignInMethod, value: string): boolean {
  return method === 'email' ? isEmail(value) : isVnPhone(value);
}
