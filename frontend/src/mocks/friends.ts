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
import type { Friend } from '@/features/circle/types';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const now = Date.now();

export const FRIENDS: readonly Friend[] = [
  { id: 'f1', name: 'Yến', level: 9, lastAt: now - 4 * MINUTE, lastKind: 'photo', memories: 296, days: 402, toNext: 69 },
  { id: 'f2', name: 'Hưng', level: 7, lastAt: now - 40 * MINUTE, lastKind: 'message', memories: 142, days: 214, toNext: 58 },
  { id: 'f3', name: 'Duy', level: 5, lastAt: now - 6 * HOUR, lastKind: 'photo', memories: 64, days: 120, toNext: 26 },
  { id: 'f4', name: 'Linh', level: 4, lastAt: now - 26 * HOUR, lastKind: 'message', memories: 38, days: 61, toNext: 22 },
  { id: 'f5', name: 'Bảo', level: 2, lastAt: now - 3 * 24 * HOUR, lastKind: 'photo', memories: 9, days: 18, toNext: 11 },
  { id: 'f6', name: 'Thảo', level: 3, dormant: true, memories: 21, days: 90, toNext: 15 },
];

/** Góc chưa có ai — để xem màn trống. */
export const NO_FRIENDS: readonly Friend[] = [];
