/**
 * Dữ liệu giả để xem giao diện. Xoá khi nối server thật.
 *
 * Cố ý để MẢNG RỖNG: màn Góc trống là màn khó nhất và cũng là màn mọi người
 * mới thấy đầu tiên — nó phải là thứ mặc định nhìn thấy khi chạy dự án, chứ
 * không phải thứ phải sửa code mới xem được.
 * Muốn xem góc có người: bỏ chú thích khối SAMPLE bên dưới.
 */
import type { Friend } from '@/features/circle/screens/CircleScreen';

export const FRIENDS: readonly Friend[] = [];

export const SAMPLE_FRIENDS: readonly Friend[] = [
  { id: '1', name: 'Yến', level: 8 },
  { id: '2', name: 'Hưng', level: 5 },
  { id: '3', name: 'Duy', level: 3, dormant: true },
];
