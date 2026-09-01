/**
 * Lật trang bằng CON TRỎ, không bằng số trang.
 *
 * Bảng tin là dòng chảy: trong lúc người ta cuộn thì có ảnh mới chen lên đầu.
 * Với `?page=2` thì mấy tấm ở ranh giới hoặc bị nhảy qua, hoặc hiện hai lần —
 * và không ai báo lỗi cả, người dùng chỉ thấy app "hơi kỳ".
 *
 * Con trỏ neo vào một ĐIỂM trong dòng chảy nên không bị chuyện đó.
 */
export interface ICursorQuery {
  /** Bỏ trống là lấy từ đầu. */
  cursor?: string;
  limit?: number;
}

export interface ICursorPage<T> {
  items: T[];
  /** `null` nghĩa là hết. Có giá trị thì đưa lại vào `cursor` để lấy tiếp. */
  nextCursor: string | null;
}
