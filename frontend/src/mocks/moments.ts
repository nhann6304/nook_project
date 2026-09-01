/**
 * Dữ liệu giả để xem giao diện. Xoá khi nối server thật.
 *
 * Bốn ảnh mẫu nằm trong assets/images/sample/. Chúng là hình VẼ trong bảng màu
 * của Nook, không phải ảnh chụp người thật — cố ý: một tấm ảnh người lạ trong
 * bản demo trông như dữ liệu thật, rồi có ngày lọt lên ảnh chụp màn hình gửi
 * cho người khác. Hình vẽ thì ai nhìn cũng biết đây là chỗ giữ chỗ.
 *
 * Mốc thời gian tính LÙI từ lúc mở app, không phải ngày cố định — để "3 phút
 * trước" luôn đúng là ba phút trước, chứ không thành "412 ngày trước" sau vài
 * tháng nữa.
 */
import type { Author, Moment } from '@/features/feed/types';

/** Chính mình. Tên và ảnh sẽ lấy từ hồ sơ khi có backend. */
export const ME: Author = { id: 'me', name: 'Bạn', level: 10 };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const AUTHORS: Record<string, Author> = {
  yen: { id: 'f1', name: 'Yến', level: 9 },
  hung: { id: 'f2', name: 'Hưng', level: 7 },
  duy: { id: 'f3', name: 'Duy', level: 5 },
  thao: { id: 'f6', name: 'Thảo', level: 3, dormant: true },
};

/**
 * `Date.now()` gọi ở đây là gọi lúc nạp module — một lần, lúc khởi động.
 * Đừng chuyển vào trong mảng: nó sẽ chạy lại mỗi lần có ai đọc file này.
 */
const now = Date.now();

export const SEED_MOMENTS: readonly Moment[] = [
  {
    id: 's1',
    photo: require('../../assets/images/sample/moment-1.png'),
    caption: 'Về tới nhà đúng lúc trời chuyển màu',
    at: now - 4 * MINUTE,
    author: AUTHORS.yen!,
  },
  {
    id: 's2',
    photo: require('../../assets/images/sample/moment-3.png'),
    caption: 'Ly thứ ba rồi mà vẫn chưa tỉnh',
    at: now - 52 * MINUTE,
    author: AUTHORS.hung!,
  },
  {
    id: 's3',
    photo: require('../../assets/images/sample/moment-2.png'),
    at: now - 6 * HOUR,
    author: AUTHORS.duy!,
  },
  {
    id: 's4',
    photo: require('../../assets/images/sample/moment-4.png'),
    caption: 'Đi biển một mình cũng vui',
    at: now - 26 * HOUR,
    author: AUTHORS.thao!,
  },
];

/** Chưa ai gửi gì — để xem màn trống. */
export const NO_MOMENTS: readonly Moment[] = [];
