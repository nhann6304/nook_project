/**
 * Bảng màu đang dùng.
 *
 * Cùng một khuôn với kho ngôn ngữ (`src/i18n/store.ts`) và vì cùng một lý do:
 * component đọc bằng selector, nên chừng nào người dùng chưa đổi bảng thì tham
 * chiếu không đổi và KHÔNG có gì vẽ lại. Đổi bảng thì mọi màn đang mở vẽ lại
 * đúng một lần — con số tối thiểu có thể đạt được.
 *
 * Context sẽ không làm được điều đó: nó bắt mọi thứ bên dưới vẽ lại mỗi lần
 * provider vẽ lại, kể cả những chỗ không đụng tới màu.
 */
import { create } from 'zustand';
import { readText, writeText } from '@/lib/storage';
import { DEFAULT_PALETTE, PALETTES, isPaletteKey, type Palette, type PaletteKey } from './palettes';

const SAVED_KEY = 'palette';

type ThemeState = {
  palette: Palette;
  /** `false` cho tới khi đọc xong lựa chọn cũ dưới đĩa. */
  ready: boolean;
  setPalette: (key: PaletteKey) => void;
  hydrate: () => Promise<void>;
};

export const useTheme = create<ThemeState>((set) => ({
  palette: PALETTES[DEFAULT_PALETTE],
  ready: false,

  setPalette: (key) => {
    set((s) => (s.palette.key === key ? s : { palette: PALETTES[key] }));
    void writeText(SAVED_KEY, key);
  },

  hydrate: async () => {
    const saved = await readText(SAVED_KEY);
    set((s) => {
      if (!isPaletteKey(saved) || s.palette.key === saved) return s.ready ? s : { ready: true };
      return { palette: PALETTES[saved], ready: true };
    });
  },
}));

/** Đọc bảng màu ngoài React — cho hằng số ở tầng module. Dùng rất ít. */
export function currentPalette(): Palette {
  return useTheme.getState().palette;
}
