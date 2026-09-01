/**
 * Hai bộ chữ, và danh sách ngôn ngữ app biết nói.
 *
 * Cả hai bộ đều nằm trong bundle, không tải rời. Chúng cộng lại chưa tới 10KB,
 * trong khi tải rời thì đổi ngôn ngữ sẽ có một nhịp màn hình trống — đổi 10KB
 * lấy một nhịp giật là lỗ. Khi nào lên tới sáu, bảy thứ tiếng thì tính lại.
 */
import type { Mirror } from '../types';
import { en } from './en';
import { vi } from './vi';

export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Hai kiểu, và sự khác nhau giữa chúng là cả cơ chế an toàn của module này.
 *
 * `Source` giữ NGUYÊN VĂN từng câu tiếng Việt (nhờ `as const`). Chỉ có kiểu này
 * mới đọc được "{seconds}" nằm trong câu, nên mọi suy luận về khoá và tham số
 * của t() đều bám vào nó.
 *
 * `Catalog` là hình dạng lúc CHẠY: cùng bộ khoá, nhưng lá đã nới thành `string`.
 * Cả `vi` lẫn `en` đều vừa khuôn này — kho chứa được cả hai mà không mất khoá
 * nào.
 */
export type Source = typeof vi;
export type Catalog = Mirror<Source>;

export const CATALOGS: Readonly<Record<Locale, Catalog>> = { vi, en };

/** Tên ngôn ngữ viết bằng chính nó — danh sách chọn không bao giờ dịch tên. */
export const LOCALE_NAMES: Readonly<Record<Locale, string>> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

export function isLocale(v: string | null | undefined): v is Locale {
  return v === 'vi' || v === 'en';
}
