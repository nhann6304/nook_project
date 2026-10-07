/**
 * `useColors()` và `useStyles()` — hai cửa duy nhất để chạm vào màu.
 *
 * ── Vì sao không gọi thẳng StyleSheet.create ở tầng module nữa ───────────
 * `StyleSheet.create` chạy MỘT LẦN lúc nạp file và chốt cứng mọi giá trị bên
 * trong. Người dùng đổi bảng màu thì cái style đó vẫn giữ nguyên màu cũ, mãi
 * mãi, cho tới khi tắt app. Đó là lý do mọi màu phải đi qua đây.
 *
 * ── Vì sao không tốn hiệu năng ──────────────────────────────────────────
 * Style được nhớ lại theo cặp (hàm dựng, bảng màu) trong một bảng tra ở tầng
 * module. Một component với một bảng màu → `StyleSheet.create` chạy đúng MỘT
 * lần trong cả đời app, không phải mỗi lần vẽ. Đổi bảng rồi đổi về là lấy lại
 * bản đã nhớ, không dựng lại.
 *
 * Bảng tra ngoài cùng là `WeakMap` khoá theo chính hàm dựng: component bị gỡ
 * và hàm dựng thành rác thì mục tương ứng tự biến mất.
 *
 * ── Khuôn dùng ──────────────────────────────────────────────────────────
 *
 *   const make = (c: Palette) =>
 *     StyleSheet.create({ box: { backgroundColor: c.surface } });
 *
 *   function Thing() {
 *     const s = useStyles(make);            // style
 *     const c = useColors();                // màu rời, cho prop `color` của icon
 *     return <View style={s.box}><Icon color={c.textMuted} /></View>;
 *   }
 *
 * `make` PHẢI khai ở tầng module, không khai trong thân component — khai trong
 * thân là mỗi lần vẽ một hàm mới, khoá mới, và bảng tra không bao giờ trúng.
 */
import { useEffect } from 'react';
import { AppState, useColorScheme } from 'react-native';
import { useTheme } from './theme';
import type { Palette, ThemeKey } from './palettes';

export function useColors(): Palette {
  return useTheme((s) => s.palette);
}

type Factory<T> = (c: Palette) => T;

const cache = new WeakMap<Factory<unknown>, Map<ThemeKey, unknown>>();

export function useStyles<T>(make: Factory<T>): T {
  const palette = useColors();

  let byPalette = cache.get(make as Factory<unknown>);
  if (!byPalette) {
    byPalette = new Map();
    cache.set(make as Factory<unknown>, byPalette);
  }

  let styles = byPalette.get(palette.key) as T | undefined;
  if (styles === undefined) {
    styles = make(palette);
    byPalette.set(palette.key, styles);
  }
  return styles;
}

/**
 * Bóng đổ mang màu nhấn. Là hàm chứ không phải hằng vì nó phụ thuộc bảng màu.
 */
export function glow(c: Palette) {
  return {
    accent: {
      shadowColor: c.accent,
      shadowOpacity: 0.22,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    accentPressed: {
      shadowColor: c.accent,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    none: { shadowOpacity: 0, elevation: 0 },
  } as const;
}

/**
 * Gọi ĐÚNG MỘT LẦN ở app/_layout.tsx.
 *
 * Trả `true` khi đã đọc xong bảng màu người dùng chọn lần trước. Màn chờ nên
 * đợi cờ này: vẽ bằng bảng mặc định rồi đổi sang bảng đã chọn là người dùng
 * thấy cả app nháy một cái đổi màu ngay giây đầu tiên.
 */
export function useThemeReady(): boolean {
  const ready = useTheme((s) => s.ready);
  const hydrate = useTheme((s) => s.hydrate);
  const setSystemDark = useTheme((s) => s.setSystemDark);
  const tick = useTheme((s) => s.tick);
  const scheme = useColorScheme();
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  // Luôn theo dõi nền máy, kể cả khi đang chế độ khác: chuyển sang "Theo máy"
  // là đúng màu ngay, không chờ máy đổi lần sau.
  useEffect(() => {
    setSystemDark(scheme === 'dark');
  }, [scheme, setSystemDark]);
  // "Theo trời": mỗi phút xem đã sang cảnh mới chưa, và xem lại ngay khi app
  // quay về từ nền (qua đêm, mở máy là đúng màu buổi sáng). `tick` không đổi
  // bảng thì không `set` — không ai vẽ lại.
  useEffect(() => {
    const timer = setInterval(tick, 60_000);
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') tick();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [tick]);
  return ready;
}

/**
 * Bóng của mặt "kính". Android: `elevation` trên nền trong suốt vẽ ra viền
 * xám bẩn, nên `glass` luôn là màu ĐẶC.
 */
export function lift(c: Palette) {
  return {
    shadowColor: c.shadow,
    shadowOpacity: c.light ? 0.1 : 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  } as const;
}
