/**
 * Khoá ngày 'YYYY-MM-DD' theo giờ CỦA NGƯỜI DÙNG, không theo giờ máy chủ.
 *
 * Vì sao quan trọng: trần "3 ký ức một ngày" và chuỗi ngày liền nhau đều tính
 * theo ngày mà người dùng đang sống. Máy chủ chạy giờ UTC; một người ở Việt Nam
 * đăng ảnh lúc 6 giờ sáng thì với UTC đó vẫn là ngày hôm qua.
 *
 * `offsetMinutes` là độ lệch so với UTC tính bằng phút — Việt Nam là +420.
 * Ở app lấy bằng `-new Date().getTimezoneOffset()`.
 */
export function dayKey(at: Date, offsetMinutes: number): string {
  const shifted = new Date(at.getTime() + offsetMinutes * 60_000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Khoảng cách theo NGÀY giữa hai khoá ngày. Dùng để tính chuỗi ngày liền nhau. */
export function daysBetween(fromKey: string, toKey: string): number {
  const from = Date.parse(`${fromKey}T00:00:00Z`);
  const to = Date.parse(`${toKey}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}
