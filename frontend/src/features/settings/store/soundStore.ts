/** Công tắc âm thanh cho màn Cài đặt. Nguồn thật nằm ở `src/lib/sound.ts`. */
import { create } from 'zustand';
import { setSoundEnabled } from '@/lib/device/sound';

type SoundState = {
  on: boolean;
  /** Đọc lựa chọn đã lưu lúc mở app. */
  hydrate: (on: boolean) => void;
  set: (on: boolean) => void;
};

export const useSound = create<SoundState>((set) => ({
  on: true,
  hydrate: (on) => set({ on }),
  set: (on) => {
    setSoundEnabled(on);
    set({ on });
  },
}));
