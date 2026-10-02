/**
 * Gập chữ để so khi tìm: bỏ dấu, bỏ "@", chữ thường. Gõ "yen" vẫn ra "Yến" —
 * phần lớn người ta gõ không dấu khi tìm.
 */
const MARKS = /[̀-ͯ]/g;

export function fold(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(MARKS, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/^@/, '')
    .trim()
    .toLowerCase();
}

/** Khớp khi MỘT chữ trong tên (hoặc tên người dùng) bắt đầu bằng thứ đã gõ. */
export function matches(query: string, ...fields: readonly string[]): boolean {
  const q = fold(query);
  if (!q) return false;
  return fields.some((f) => {
    const v = fold(f);
    return v.startsWith(q) || v.split(/[\s._]+/).some((w) => w.startsWith(q));
  });
}
