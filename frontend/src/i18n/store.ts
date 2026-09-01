/**
 * Ngôn ngữ đang dùng.
 *
 * Vì sao hàm `t` nằm TRONG kho chứ không dựng lại ở mỗi component: component
 * đọc kho bằng selector `(s) => s.t`. Chừng nào ngôn ngữ chưa đổi thì `t` vẫn
 * đúng một tham chiếu cũ → Zustand thấy không đổi → KHÔNG vẽ lại gì cả. Đổi
 * ngôn ngữ thì `t` thành tham chiếu mới → mọi màn đang mở vẽ lại đúng một lần.
 * Đó là con số tối thiểu có thể đạt được, và nó là lý do không dùng Context:
 * Context bắt mọi thứ bên dưới vẽ lại mỗi lần provider vẽ lại.
 *
 * Thứ tự quyết định ngôn ngữ lúc mở app:
 *   1. Người dùng đã tự chọn lần trước → theo lựa chọn đó.
 *   2. Chưa chọn bao giờ → theo ngôn ngữ máy.
 *   3. Ngôn ngữ máy không phải vi/en → tiếng Anh.
 */
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { readText, writeText } from '@/lib/storage';
import { makeT, type T } from './core';
import { isLocale, type Locale } from './locales';

const SAVED_KEY = 'locale';

/** Ngôn ngữ máy, đã quy về danh sách app biết nói. */
export function systemLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return isLocale(code) ? code : 'en';
}

type I18nState = {
  locale: Locale;
  /** `true` nếu đang chạy theo máy vì người dùng chưa tự chọn bao giờ. */
  following: boolean;
  /** `false` cho tới khi đọc xong lựa chọn cũ dưới đĩa. */
  ready: boolean;
  t: T;

  /** Người dùng tự chọn. Ghi xuống đĩa, lần mở sau vẫn thế. */
  setLocale: (locale: Locale) => void;
  /** Bỏ lựa chọn riêng, quay về theo máy. */
  followSystem: () => void;
  /** Gọi một lần lúc khởi động. */
  hydrate: () => Promise<void>;
};

const initial = systemLocale();

export const useI18n = create<I18nState>((set) => ({
  locale: initial,
  following: true,
  ready: false,
  t: makeT(initial),

  setLocale: (locale) => {
    set((s) => (s.locale === locale && !s.following ? s : { locale, following: false, t: makeT(locale) }));
    void writeText(SAVED_KEY, locale);
  },

  followSystem: () => {
    const locale = systemLocale();
    set((s) => (s.locale === locale && s.following ? s : { locale, following: true, t: makeT(locale) }));
    void writeText(SAVED_KEY, '');
  },

  hydrate: async () => {
    const saved = await readText(SAVED_KEY);
    set((s) => {
      if (!isLocale(saved)) return s.ready ? s : { ready: true };
      // Đã bằng nhau thì giữ nguyên `t` — đổi tham chiếu ở đây là bắt cả app
      // vẽ lại một lần vô ích ngay lúc khởi động, đúng lúc bận nhất.
      if (s.locale === saved) return { ready: true, following: false };
      return { locale: saved, following: false, ready: true, t: makeT(saved) };
    });
  },
}));
