/**
 * Chọn dạng số nhiều.
 *
 * KHÔNG dùng `Intl.PluralRules`. Đã đo trên chính Hermes của dự án này (SDK 54
 * / RN 0.81): `Intl` có `NumberFormat` và `DateTimeFormat`, nhưng
 * `Intl.PluralRules`, `Intl.RelativeTimeFormat` và `Intl.ListFormat` đều ném
 * "Cannot read property 'prototype' of undefined". Gọi vào là app chết ngay
 * dòng đầu tiên vẽ một câu có số — mà lại chỉ chết trên máy thật, không chết
 * lúc phát triển trên web. Cách đo lại: mục 8 của docs/06-libraries.md.
 *
 * Luật cho hai ngôn ngữ của Nook, lấy từ CLDR:
 *   vi  chỉ có `other`  — "1 người bạn", "10 người bạn" viết y hệt nhau
 *   en  có `one` và `other`, `one` dùng đúng khi n = 1
 *
 * Thêm ngôn ngữ thứ ba (tiếng Nga 4 dạng, tiếng Ả Rập 6 dạng) thì chỗ này
 * không đủ nữa — lúc đó mới là lúc cân nhắc thư viện, không phải bây giờ.
 */
import type { Locale } from './locales';
import type { Plural } from './types';

export function pickPlural(locale: Locale, form: Plural, count: number): string {
  if (locale === 'en' && count === 1 && form.one !== undefined) return form.one;
  return form.other;
}
