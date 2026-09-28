/**
 * Nhật ký — mọi tấm mình đã gửi, mới nhất trước. Đang giữ trong bộ nhớ như các
 * kho khác; nguồn thật sẽ là server.
 */
import { create } from 'zustand';
import { SEED_JOURNAL } from '@/mocks/journal';
import type { PhotoSource } from '@/features/feed/types';
import type { Entry } from '../types';

let seq = 0;

type JournalState = {
  entries: readonly Entry[];
  add: (photo: PhotoSource, caption: string, at: number) => void;
};

export const useJournal = create<JournalState>((set) => ({
  entries: SEED_JOURNAL,
  add: (photo, caption, at) =>
    set((s) => ({
      entries: [{ id: `me-${++seq}`, photo, caption: caption || undefined, at }, ...s.entries],
    })),
}));
