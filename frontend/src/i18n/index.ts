/**
 * i18n — CỬA DUY NHẤT. Mọi nơi import từ '@i18n', không ai import file con.
 *
 * Cách dùng trong một màn:
 *
 *   const t = useT();
 *   <Txt>{t('welcome.headline')}</Txt>
 *   <Txt>{t('verify.resendIn', { seconds: 42 })}</Txt>
 *   <Txt>{t('feed.minutesAgo', { count: 3 })}</Txt>
 *
 * Ba thứ tsc bắt được ngay trong editor: gõ sai khoá, thiếu bản dịch tiếng Anh,
 * quên truyền tham số. Xem types.ts để biết vì sao.
 *
 * Ngoài React (ví dụ trong *Api.ts) thì dùng `translate()` — cùng một bộ chữ,
 * cùng một ngôn ngữ đang chọn, chỉ khác là không theo dõi thay đổi.
 */
import { useCallback, useEffect } from 'react';
import { checkTranslations, type Key, type T } from './core';
import { formatDate, formatNumber, timeAgo, type Ago } from './format';
import { LOCALES, LOCALE_NAMES, type Locale, type Source } from './locales';
import { useI18n } from './store';
import type { Args, At } from './types';

export type { Key, Locale, T };
export { LOCALES, LOCALE_NAMES };

/**
 * Hàm dịch. Tham chiếu ĐỨNG YÊN chừng nào ngôn ngữ chưa đổi, nên nó đặt được
 * vào mảng phụ thuộc của useCallback/useMemo mà không gây vẽ lại thừa.
 */
export function useT(): T {
  return useI18n((s) => s.t);
}

/** Ngôn ngữ đang dùng — cho chỗ cần chính con số/ngày đúng vùng. */
export function useLocale(): Locale {
  return useI18n((s) => s.locale);
}

/** Đang chạy theo ngôn ngữ máy hay theo lựa chọn riêng của người dùng. */
export function useFollowingSystem(): boolean {
  return useI18n((s) => s.following);
}

export function useSetLocale(): (locale: Locale) => void {
  return useI18n((s) => s.setLocale);
}

export function useFollowSystem(): () => void {
  return useI18n((s) => s.followSystem);
}

/** Dịch ngoài React. Đừng giữ lại kết quả — người dùng đổi ngôn ngữ là nó cũ. */
export function translate<K extends Key>(key: K, ...args: Args<At<Source, K>>): string {
  return useI18n.getState().t(key, ...args);
}

/* ---------- Số và ngày theo ngôn ngữ đang chọn ---------- */

/*
 * Cả ba hook dưới đây bọc `useCallback`, và đó KHÔNG phải là làm cho có.
 *
 * Trả về một mũi tên mới mỗi lần vẽ thì hàm đó rơi vào mảng phụ thuộc của
 * `useCallback` ở chỗ gọi — ví dụ `renderItem` trong FeedScreen — làm renderItem
 * cũng mới theo, và FlashList coi mọi ô là ô mới. Mất sạch cái lợi của tái dùng ô,
 * đúng ở màn cuộn nhiều nhất.
 *
 * Ngôn ngữ đứng yên thì cả ba hàm này đứng yên.
 */

export function useNumber(): (value: number) => string {
  const locale = useLocale();
  return useCallback((value: number) => formatNumber(locale, value), [locale]);
}

export function useDate(): (value: Date, options: Intl.DateTimeFormatOptions) => string {
  const locale = useLocale();
  return useCallback(
    (value: Date, options: Intl.DateTimeFormatOptions) => formatDate(locale, value, options),
    [locale],
  );
}

/** "3 phút trước" / "3 minutes ago". Truyền `now` vào để test được. */
export function useAgo(): (from: Date, now?: Date) => string {
  const t = useT();
  return useCallback((from: Date, now?: Date) => {
    const ago: Ago = timeAgo(from, now ?? new Date());
    switch (ago.unit) {
      case 'now':
        return t('feed.justNow');
      case 'minutes':
        return t('feed.minutesAgo', { count: ago.count });
      case 'hours':
        return t('feed.hoursAgo', { count: ago.count });
      case 'days':
        return t('feed.daysAgo', { count: ago.count });
    }
  }, [t]);
}

/* ---------- Khởi động ---------- */

/**
 * Gọi ĐÚNG MỘT LẦN ở app/_layout.tsx.
 *
 * Trả về `true` khi đã đọc xong lựa chọn ngôn ngữ cũ dưới đĩa. Màn chờ nên đợi
 * cờ này: vẽ trước rồi đổi chữ sau là người dùng thấy màn hình nháy một cái
 * bằng sai ngôn ngữ — chỉ khoảng 30ms, nhưng là 30ms đầu tiên họ nhìn thấy.
 */
export function useI18nReady(): boolean {
  const ready = useI18n((s) => s.ready);
  const hydrate = useI18n((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!__DEV__) return;
    const problems = checkTranslations();
    if (problems.length) console.warn('[i18n]\n' + problems.join('\n'));
  }, []);

  return ready;
}
