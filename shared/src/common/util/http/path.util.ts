/**
 * Ghép đường dẫn có chỗ trống: '/v1/circle/:id' + { id: 'abc' } → '/v1/circle/abc'
 *
 * Backend không cần hàm này — Nest tự hiểu `:id`. Nó là để app dùng chung đúng
 * chuỗi hằng số với backend, thay vì nối tay rồi gõ sai một dấu gạch.
 */
export function path(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/:(\w+)/g, (_whole, key: string) => {
    const value = params[key];
    if (value === undefined) throw new Error(`Thiếu tham số đường dẫn: ${key}`);
    return encodeURIComponent(String(value));
  });
}

/** Nối chuỗi truy vấn, bỏ qua giá trị rỗng. */
export function query(params: Record<string, string | number | boolean | undefined>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}
