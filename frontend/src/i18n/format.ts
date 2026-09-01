/**
 * Số, ngày, giờ theo ngôn ngữ đang chọn.
 *
 * Dùng `Intl` của Hermes — đã đo là có thật và ra đúng: 1234567,5 thành
 * "1.234.567,5" (vi) và "1,234,567.5" (en). Nhưng CHỈ `NumberFormat` và
 * `DateTimeFormat`; `PluralRules`/`RelativeTimeFormat`/`ListFormat` không có
 * (xem plural.ts). Vì vậy mọi lời gọi ở đây đều có đường lùi: một máy Android
 * cũ thiếu ICU thì hiện số thô còn hơn app chết.
 *
 * Dựng `Intl.NumberFormat` tốn khoảng 1ms mỗi lần. Trong một danh sách cuộn thì
 * đó là 1ms × số ô × mỗi lần vẽ. Nên nhớ lại theo ngôn ngữ, dựng đúng một lần.
 */
import type { Locale } from './locales';

/** vi → 'vi-VN', en → 'en-US'. Intl cần thẻ đầy đủ mới ra đúng dấu phân cách. */
const TAG: Readonly<Record<Locale, string>> = { vi: 'vi-VN', en: 'en-US' };

const numbers = new Map<Locale, Intl.NumberFormat>();

export function formatNumber(locale: Locale, value: number): string {
  try {
    let f = numbers.get(locale);
    if (!f) {
      f = new Intl.NumberFormat(TAG[locale]);
      numbers.set(locale, f);
    }
    return f.format(value);
  } catch {
    return String(value);
  }
}

const dates = new Map<string, Intl.DateTimeFormat>();

export function formatDate(
  locale: Locale,
  value: Date,
  options: Intl.DateTimeFormatOptions,
): string {
  const id = locale + JSON.stringify(options);
  try {
    let f = dates.get(id);
    if (!f) {
      f = new Intl.DateTimeFormat(TAG[locale], options);
      dates.set(id, f);
    }
    return f.format(value);
  } catch {
    return value.toDateString();
  }
}

/* ---------- "3 phút trước" ---------- */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Khoảng thời gian đã trôi qua, dạng người đọc.
 *
 * Tự tính chứ không dùng `Intl.RelativeTimeFormat` (Hermes không có nó). Trả về
 * khoá + số để chỗ gọi tự dịch — chính vì thế file này không cần biết t() tồn
 * tại, và nó test được mà không cần dựng cả bộ chữ.
 *
 * Nook chỉ giữ khoảnh khắc 48 giờ nên không cần đơn vị nào lớn hơn ngày.
 */
export type Ago =
  | { unit: 'now' }
  | { unit: 'minutes' | 'hours' | 'days'; count: number };

export function timeAgo(from: Date, now: Date): Ago {
  const ms = Math.max(0, now.getTime() - from.getTime());
  if (ms < MINUTE) return { unit: 'now' };
  if (ms < HOUR) return { unit: 'minutes', count: Math.floor(ms / MINUTE) };
  if (ms < DAY) return { unit: 'hours', count: Math.floor(ms / HOUR) };
  return { unit: 'days', count: Math.floor(ms / DAY) };
}
