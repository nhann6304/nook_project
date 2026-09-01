/**
 * Sức chứa của góc, đã cộng hết thành tích đã mở.
 *
 * Đặt ở `circle/` chứ không ở `achievement/` dù cửa thành tích là nơi trả nó
 * về: nó nói về CÁI GÓC. Thành tích chỉ là một trong những thứ làm nó to ra.
 */
export interface CircleCapacity {
  /** Chỗ ai cũng có */
  base: number;
  /** Chỗ kiếm thêm được */
  extra: number;
  /** Tổng đang dùng được (đã chặn ở trần) */
  capacity: number;
  /** Trần tuyệt đối */
  max: number;
  /** Đang có mấy người trong góc */
  used: number;
}
