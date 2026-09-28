/**
 * Nhật ký giả: ảnh mình đã gửi trong khoảng hơn một năm qua. Xoá khi có server.
 * Cố ý có ngày trống xen giữa — nhật ký thật không bao giờ kín mọi ngày.
 */
import type { Entry } from '@/features/journal/types';

const DAY = 24 * 60 * 60_000;
const now = Date.now();

const PHOTOS = [
  require('../../assets/images/sample/moment-1.png'),
  require('../../assets/images/sample/moment-2.png'),
  require('../../assets/images/sample/moment-3.png'),
  require('../../assets/images/sample/moment-4.png'),
];

const CAPTIONS = ['Chiều nay trên mái nhà', undefined, 'Ly thứ hai rồi đó', 'Đi bộ về, phố còn sáng', undefined];

/** Lùi bao nhiêu ngày thì có ảnh. */
const BACK = [
  1, 2, 4, 5, 7, 8, 11, 13, 14, 18, 21, 22, 25, 29, 33, 36, 41, 47, 52, 60, 66, 74, 81, 95, 102, 118,
  131, 146, 160, 177, 190, 214, 230, 251, 268, 290, 305, 322, 340, 356, 371, 390,
];

export const SEED_JOURNAL: readonly Entry[] = BACK.map((d, i) => ({
  id: `j${i}`,
  photo: PHOTOS[i % PHOTOS.length],
  caption: CAPTIONS[i % CAPTIONS.length],
  // Giữa buổi chiều của ngày đó, lệch nhau vài giờ cho tự nhiên.
  at: now - d * DAY - ((i * 37) % 6) * 60 * 60_000,
}));
