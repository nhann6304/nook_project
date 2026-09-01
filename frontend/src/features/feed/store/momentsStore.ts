/**
 * Kho khoảnh khắc.
 *
 * Đang giữ trong bộ nhớ: đóng app là mất. Có chủ đích — Nook chỉ giữ khoảnh
 * khắc 48 giờ và nguồn thật sẽ là server, nên viết một lớp lưu xuống đĩa bây
 * giờ là viết một thứ sắp bị xoá.
 *
 * Ảnh mình vừa chụp được thêm vào ĐẦU danh sách ngay, không chờ mạng: người
 * dùng bấm gửi xong vuốt lên là thấy ảnh của mình nằm đó. Khi có backend thì
 * chỗ này thành "thêm lạc quan rồi hoà lại sau" — cấu trúc đã sẵn.
 */
import { create } from 'zustand';
import { ME, SEED_MOMENTS } from '@/mocks/moments';
import type { Moment, PhotoSource } from '../types';

let seq = 0;
/** Không dùng Math.random: id chỉ cần duy nhất trong một lượt mở app. */
const nextId = () => `mine-${++seq}`;

type MomentsState = {
  moments: readonly Moment[];
  add: (photo: PhotoSource, caption: string, at: number) => void;
  markReplied: (id: string) => void;
  clear: () => void;
};

export const useMoments = create<MomentsState>((set) => ({
  moments: SEED_MOMENTS,

  add: (photo, caption, at) =>
    set((s) => ({
      moments: [
        { id: nextId(), photo, caption: caption || undefined, at, author: ME, mine: true },
        ...s.moments,
      ],
    })),

  markReplied: (id) =>
    set((s) => ({
      moments: s.moments.map((m) => (m.id === id ? { ...m, repliedTo: true } : m)),
    })),

  clear: () => set({ moments: [] }),
}));
