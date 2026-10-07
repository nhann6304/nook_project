/**
 * Bảng màu đang dùng.
 *
 * Cùng khuôn với kho ngôn ngữ (`src/i18n/store.ts`): đọc bằng selector, chừng
 * nào bảng chưa đổi thì tham chiếu không đổi và KHÔNG có gì vẽ lại.
 *
 * Hai lựa chọn độc lập:
 *   · `mode`   — Theo trời (mặc định) · Sáng · Tối · Theo máy.
 *   · `accent` — màu locket, năm màu.
 * "Theo trời": cảnh đổi theo giờ máy (`sceneAt`), mưa thì sang cảnh mưa —
 * `raining` do `features/sky` đặt, app không tự đoán thời tiết.
 */
import { create } from 'zustand';
import { readText, writeText } from '@/lib/storage';
import {
  DEFAULT_ACCENT,
  isAccentKey,
  paletteOf,
  sceneAt,
  type AccentKey,
  type Palette,
  type Scene,
} from './palettes';

const MODE_KEY = 'themeMode';
const ACCENT_KEY = 'accent';

export const THEME_MODES = ['sky', 'light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

const isMode = (v: string | null): v is ThemeMode => THEME_MODES.includes(v as ThemeMode);

type ThemeState = {
  palette: Palette;
  mode: ThemeMode;
  accent: AccentKey;
  /** Máy đang tối — chỉ có nghĩa khi `mode = 'system'`. */
  systemDark: boolean;
  raining: boolean;
  /** `false` cho tới khi đọc xong lựa chọn cũ dưới đĩa. */
  ready: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentKey) => void;
  setSystemDark: (dark: boolean) => void;
  setRaining: (raining: boolean) => void;
  /** Đọc lại giờ; đổi bảng nếu đã sang cảnh mới. */
  tick: () => void;
  hydrate: () => Promise<void>;
};

type Inputs = Pick<ThemeState, 'mode' | 'accent' | 'systemDark' | 'raining'>;

function sceneOf({ mode, systemDark, raining }: Inputs): Scene {
  if (mode === 'light') return 'noon';
  if (mode === 'dark') return 'night';
  if (mode === 'system') return systemDark ? 'night' : 'noon';
  return sceneAt(new Date().getHours(), raining);
}

const resolve = (i: Inputs) => paletteOf(sceneOf(i), i.accent);

/** Bảng màu cho một lựa chọn CHƯA lưu — trang Giao diện xem trước bằng cái này. */
export function previewPalette(mode: ThemeMode, accent: AccentKey): Palette {
  const { systemDark, raining } = useTheme.getState();
  return resolve({ mode, accent, systemDark, raining });
}

export const useTheme = create<ThemeState>((set, get) => {
  /** Chỉ `set` khi bảng thật sự đổi — giữ tham chiếu cũ là không ai vẽ lại. */
  const apply = (patch: Partial<Inputs>) => {
    const next = { ...get(), ...patch };
    const palette = resolve(next);
    set(palette.key === get().palette.key ? patch : { ...patch, palette });
  };

  return {
    palette: resolve({ mode: 'sky', accent: DEFAULT_ACCENT, systemDark: false, raining: false }),
    mode: 'sky',
    accent: DEFAULT_ACCENT,
    systemDark: false,
    raining: false,
    ready: false,

    setMode: (mode) => {
      apply({ mode });
      void writeText(MODE_KEY, mode);
    },
    setAccent: (accent) => {
      apply({ accent });
      void writeText(ACCENT_KEY, accent);
    },
    setSystemDark: (systemDark) => apply({ systemDark }),
    setRaining: (raining) => apply({ raining }),
    tick: () => apply({}),

    hydrate: async () => {
      const [m, a] = await Promise.all([readText(MODE_KEY), readText(ACCENT_KEY)]);
      apply({ mode: isMode(m) ? m : 'sky', accent: isAccentKey(a) ? a : DEFAULT_ACCENT });
      set({ ready: true });
    },
  };
});

/** Đọc bảng màu ngoài React — cho hằng số ở tầng module. Dùng rất ít. */
export function currentPalette(): Palette {
  return useTheme.getState().palette;
}
