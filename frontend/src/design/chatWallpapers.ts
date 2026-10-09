/**
 * Nền khung chat (09/10/2026, như Telegram). Mỗi nền một dải màu hai chặng
 * cho nền sáng và nền tối; `pattern` = rải hình vẽ mờ (tim, sao, máy ảnh…)
 * lên trên, như nền hoạ tiết của Telegram. `default` đi theo trời của app.
 * Tên nền là hợp đồng với server (`CHAT_BACKGROUNDS` ở `@nook/shared`).
 */
import type { TChatBackground } from '@nook/shared/model/type';
import type { Palette } from './palettes';

type Pair = readonly [top: string, bottom: string];
type Spec = { light: Pair; dark: Pair; pattern: boolean };

const SPECS: Readonly<Record<Exclude<TChatBackground, 'default'>, Spec>> = {
  sky: { light: ['#CFE3FF', '#F1F7FF'], dark: ['#1C2D52', '#0E1528'], pattern: false },
  sunset: { light: ['#FFD2C2', '#FFF0E8'], dark: ['#3D2132', '#1A121D'], pattern: false },
  mint: { light: ['#C9EFD8', '#F0FBF4'], dark: ['#163327', '#0D1A14'], pattern: false },
  lavender: { light: ['#DED3FF', '#F6F2FF'], dark: ['#2A2148', '#140F27'], pattern: false },
  peach: { light: ['#FFE0B5', '#FFF7EA'], dark: ['#3B2A15', '#1A130B'], pattern: false },
  night: { light: ['#24305A', '#0E1430'], dark: ['#1A2246', '#090D1F'], pattern: true },
  doodle: { light: ['#D9E6FB', '#EEF3FC'], dark: ['#18223A', '#0F1626'], pattern: true },
};

export type Wallpaper = {
  colors: Pair;
  /** Màu hình vẽ rải mờ — `null` là nền trơn. */
  pattern: string | null;
  /** Nền tối — chữ ngày / "đang gõ" trên nền phải sáng. */
  dark: boolean;
};

export function wallpaperOf(c: Palette, key: TChatBackground): Wallpaper {
  if (key === 'default') {
    return { colors: [c.skyLow, c.bg], pattern: c.textFaint, dark: !c.light };
  }
  const spec = SPECS[key];
  const dark = key === 'night' || !c.light;
  return {
    colors: c.light ? spec.light : spec.dark,
    pattern: spec.pattern ? (dark ? '#FFFFFF' : c.accent) : null,
    dark,
  };
}
