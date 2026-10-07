import { create } from 'zustand';
import { listNotices, markAllRead } from '../lib/notifyApi';
import type { Notice } from '../types';

type NotifyState = {
  notices: readonly Notice[];
  load: () => Promise<void>;
  /** Mở màn thông báo là coi như đã xem hết — chấm đỏ tắt. */
  readAll: () => void;
};

export const useNotify = create<NotifyState>((set, get) => ({
  notices: [],
  load: async () => {
    const list = await listNotices();
    if (list) set({ notices: list });
  },
  readAll: () => {
    if (!get().notices.some((n) => !n.read)) return;
    set({ notices: get().notices.map((n) => (n.read ? n : { ...n, read: true })) });
    void markAllRead();
  },
}));
