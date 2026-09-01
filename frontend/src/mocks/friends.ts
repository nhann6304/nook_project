/**
 * Dữ liệu giả để xem giao diện. Xoá khi nối server thật.
 *
 * Mặc định là góc CÓ NGƯỜI. Trước đây để mảng rỗng cho màn trống thành thứ
 * nhìn thấy đầu tiên — hoá ra sai: chạy dự án lên chỉ thấy toàn khung đứt nét,
 * không biết app thật trông thế nào. Muốn xem màn trống thì đổi một chữ ở
 * app/(app)/circle.tsx: FRIENDS → NO_FRIENDS.
 *
 * Sáu người chứ không phải mười: góc đầy là trường hợp hiếm, còn góc đang lấp
 * dở mới là thứ người dùng nhìn thấy phần lớn thời gian — và nó là bố cục khó
 * hơn (vừa có avatar vừa có chỗ trống trong cùng một lưới).
 */
import type { Friend } from '@/features/circle/screens/CircleScreen';

export const FRIENDS: readonly Friend[] = [
  { id: 'f1', name: 'Yến', level: 9 },
  { id: 'f2', name: 'Hưng', level: 7 },
  { id: 'f3', name: 'Duy', level: 5 },
  { id: 'f4', name: 'Linh', level: 4 },
  { id: 'f5', name: 'Bảo', level: 2 },
  { id: 'f6', name: 'Thảo', level: 3, dormant: true },
];

/** Góc chưa có ai — để xem màn trống. */
export const NO_FRIENDS: readonly Friend[] = [];
