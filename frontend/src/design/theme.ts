/**
 * Bảng màu đang dùng.
 *
 * Cùng một khuôn với kho ngôn ngữ (`src/i18n/store.ts`): component đọc bằng
 * selector, chừng nào bảng chưa đổi thì tham chiếu không đổi và KHÔNG có gì vẽ lại.
 *
 * Hai lựa chọn độc lập:
 *   · `mode`   — Sáng (mặc định, đúng bảng thiết kế) · Tối · Theo máy.
 *   · `accent` — màu locket, năm màu.
 * "Theo trời" (đổi màu theo giờ) đã bỏ 06/10/2026 — nhìn như app tự diễn.
 */
import { create } from 'zustand';
import { readText, writeText } from '@/lib/storage';
import { DEFAULT_ACCENT, isAccentKey, paletteOf, type AccentKey, type Palette, type Tone } from './palettes';

const MODE_KEY = 'themeMode';
const ACCENT_KEY = 'accent';

export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

const isMode = (v: string | null): v is ThemeMode => THEME_MODES.includes(v as ThemeMode);

type ThemeState = {
  palette: Palette;
  mode: ThemeMode;
  accent: AccentKey;
  /** Nền máy đang báo — chỉ có nghĩa khi `mode = 'system'`. */
  system: Tone;
  /** `false` cho tới khi đọc xong lựa chọn cũ dưới đĩa. */
  ready: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentKey) => void;
  setSystem: (tone: Tone) => void;
  hydrate: () => Promise<void>;
};

const resolve = (mode: ThemeMode, system: Tone, accent: AccentKey) =>
  paletteOf(mode === 'system' ? system : mode, accent);

export const useTheme = create<ThemeState>((set, get) => ({
  palette: paletteOf('light', DEFAULT_ACCENT),
  mode: 'light',
  accent: DEFAULT_ACCENT,
  system: 'light',
  ready: false,

  setMode: (mode) => {
    const { system, accent } = get();
    set({ mode, palette: resolve(mode, system, accent) });
    void writeText(MODE_KEY, mode);
  },

  setAccent: (accent) => {
    const { mode, system } = get();
    set({ accent, palette: resolve(mode, system, accent) });
    void writeText(ACCENT_KEY, accent);
  },

  setSystem: (system) => {
    const s = get();
    if (s.system === system) return;
    set({ system, palette: resolve(s.mode, system, s.accent) });
  },

  hydrate: async () => {
    const [m, a] = await Promise.all([readText(MODE_KEY), readText(ACCENT_KEY)]);
    const mode = isMode(m) ? m : 'light';
    const accent = isAccentKey(a) ? a : DEFAULT_ACCENT;
    set({ mode, accent, palette: resolve(mode, get().system, accent), ready: true });
  },
}));

/** Đọc bảng màu ngoài React — cho hằng số ở tầng module. Dùng rất ít. */
export function currentPalette(): Palette {
  return useTheme.getState().palette;
}
