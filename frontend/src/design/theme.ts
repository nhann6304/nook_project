/**
 * Bảng màu đang dùng.
 *
 * Cùng một khuôn với kho ngôn ngữ (`src/i18n/store.ts`) và vì cùng một lý do:
 * component đọc bằng selector, nên chừng nào bảng chưa đổi thì tham chiếu
 * không đổi và KHÔNG có gì vẽ lại.
 *
 * Hai chế độ (bảng thiết kế 15b):
 *   · `auto`  — màu đi theo giờ trong ngày (`skyAt`). Mặc định.
 *   · `fixed` — giữ một trong năm bảng.
 * "Tự chỉnh màu nhấn" của bảng thiết kế chưa làm: nó cần sinh cả bộ màu và đo
 * tương phản lúc chạy.
 */
import { create } from 'zustand';
import { readText, writeText } from '@/lib/storage';
import {
  DEFAULT_PALETTE,
  PALETTES,
  SKIES,
  isPaletteKey,
  skyAt,
  type Palette,
  type PaletteKey,
} from './palettes';

const SAVED_KEY = 'palette';
const AUTO = 'auto';

export type ThemeMode = 'auto' | 'fixed';

type ThemeState = {
  palette: Palette;
  mode: ThemeMode;
  /** Bảng giữ khi `mode = 'fixed'` — nhớ cả lúc đang tự động để quay lại được. */
  fixed: PaletteKey;
  /** `false` cho tới khi đọc xong lựa chọn cũ dưới đĩa. */
  ready: boolean;
  setPalette: (key: PaletteKey) => void;
  setMode: (mode: ThemeMode) => void;
  /** Đọc lại giờ; đổi bảng nếu đã sang chặng trời mới. */
  tick: () => void;
  hydrate: () => Promise<void>;
};

const skyNow = () => SKIES[skyAt(new Date().getHours())];

export const useTheme = create<ThemeState>((set, get) => ({
  palette: skyNow(),
  mode: 'auto',
  fixed: DEFAULT_PALETTE,
  ready: false,

  setPalette: (key) => {
    set({ palette: PALETTES[key], mode: 'fixed', fixed: key });
    void writeText(SAVED_KEY, key);
  },

  setMode: (mode) => {
    const { fixed } = get();
    set({ mode, palette: mode === 'auto' ? skyNow() : PALETTES[fixed] });
    void writeText(SAVED_KEY, mode === 'auto' ? AUTO : fixed);
  },

  tick: () => {
    const s = get();
    if (s.mode !== 'auto') return;
    const next = skyNow();
    if (next.key !== s.palette.key) set({ palette: next });
  },

  hydrate: async () => {
    const saved = await readText(SAVED_KEY);
    if (isPaletteKey(saved)) {
      set({ palette: PALETTES[saved], mode: 'fixed', fixed: saved, ready: true });
      return;
    }
    set({ palette: skyNow(), mode: 'auto', ready: true });
  },
}));

/** Đọc bảng màu ngoài React — cho hằng số ở tầng module. Dùng rất ít. */
export function currentPalette(): Palette {
  return useTheme.getState().palette;
}
