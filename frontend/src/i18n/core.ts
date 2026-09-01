/**
 * Ruột của i18n: làm phẳng bộ chữ, tra khoá, điền chỗ trống.
 *
 * ── Vì sao làm phẳng ──────────────────────────────────────────────────────
 * Bộ chữ viết dạng cây lồng nhau vì đọc và sửa dễ hơn. Nhưng tra cứu theo cây
 * thì mỗi lần gọi t('camera.permission.title') phải cắt chuỗi thành mảng rồi đi
 * ba tầng — cắt chuỗi là cấp phát bộ nhớ, và t() bị gọi vài chục lần mỗi lần vẽ
 * lại một màn. Làm phẳng MỘT LẦN lúc nạp module rồi tra bằng một phép đọc thuộc
 * tính là hết chuyện. Trả giá: khoảng 0,1ms lúc khởi động cho ~120 khoá.
 *
 * ── Vì sao không dùng thư viện ────────────────────────────────────────────
 * Đã cân nhắc i18next (6 triệu lượt tải/tuần). Lý do bỏ nằm ở mục 8 của
 * docs/06-libraries.md — tóm tắt: nó nặng ~55KB cho hai ngôn ngữ và ~120 câu,
 * và cơ chế số nhiều của nó chạy trên `Intl.PluralRules` mà Hermes KHÔNG có
 * (đã đo, xem plural.ts). Đường lùi vẫn để mở: bộ chữ ở đây là JSON lồng nhau
 * đúng khuôn i18next, đổi sang là việc cơ học.
 */
import { CATALOGS, type Catalog, type Locale, type Source } from './locales';
import { pickPlural } from './plural';
import type { Args, At, Keys, Phrase, Plural } from './types';

export type Key = Keys<Source>;

/** Hàm dịch đã gắn sẵn một ngôn ngữ. */
export type T = <K extends Key>(key: K, ...args: Args<At<Source, K>>) => string;

type Flat = Readonly<Record<string, Phrase>>;

function flatten(node: object, prefix: string, out: Record<string, Phrase>): void {
  for (const [k, v] of Object.entries(node)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else if (isPlural(v)) out[key] = v;
    else flatten(v as object, key, out);
  }
}

function isPlural(v: unknown): v is Plural {
  return typeof v === 'object' && v !== null && typeof (v as Plural).other === 'string';
}

const FLAT: Readonly<Record<Locale, Flat>> = build();

function build(): Record<Locale, Flat> {
  const out = {} as Record<Locale, Flat>;
  for (const [locale, catalog] of Object.entries(CATALOGS) as [Locale, Catalog][]) {
    const flat: Record<string, Phrase> = {};
    flatten(catalog, '', flat);
    out[locale] = flat;
  }
  return out;
}

/** Chỗ trống: {name}. Tên chỉ gồm chữ và _ nên "{" lạc trong câu không bị nuốt. */
const SLOT = /\{(\w+)\}/g;

function fill(text: string, vars: Record<string, unknown> | undefined): string {
  // Đường tắt: phần lớn câu không có chỗ trống nào, khỏi đụng tới regex.
  if (text.indexOf('{') === -1) return text;
  return text.replace(SLOT, (whole, name: string) => {
    const v = vars?.[name];
    // Thiếu tham số thì để nguyên "{name}" cho lộ ra ngay khi nhìn màn hình,
    // đừng in "undefined" — "undefined" trông giống một câu chữ thật.
    return v === undefined ? whole : String(v);
  });
}

/** Dựng hàm t() cho một ngôn ngữ. Gọi lại chỉ khi người dùng đổi ngôn ngữ. */
export function makeT(locale: Locale): T {
  const flat = FLAT[locale];
  const fallback = FLAT.vi;

  return ((key: string, vars?: Record<string, unknown>) => {
    const phrase = flat[key] ?? fallback[key];

    if (phrase === undefined) {
      // Không thể xảy ra nếu tsc sạch (khoá là kiểu literal). Nhưng chuỗi vẫn
      // có thể tới đây từ dữ liệu server sau này — hiện chính cái khoá ra thì
      // còn đọc hiểu được, hơn hẳn ô trống.
      return key;
    }

    if (typeof phrase === 'string') return fill(phrase, vars);

    const count = typeof vars?.count === 'number' ? vars.count : 0;
    return fill(pickPlural(locale, phrase, count), vars);
  }) as T;
}

/* ---------- Lưới an toàn lúc phát triển ---------- */

/**
 * tsc đã lo được: thiếu khoá, sai khoá, quên tham số.
 * Nó KHÔNG lo được một chuyện: bản dịch tự chế thêm một chỗ trống mà bản gốc
 * không có — ví dụ tiếng Anh viết "{who}" trong khi tiếng Việt viết "{name}".
 * Chỗ đó tsc thấy cả hai đều là `string` nên im lặng, còn trên màn hình thì
 * người dùng đọc được đúng chữ "{who}".
 *
 * Chỉ chạy khi __DEV__. Bản phát hành không tốn một nhịp nào.
 */
function slotsOf(p: Phrase): Set<string> {
  const out = new Set<string>();
  const scan = (s: string) => {
    for (const m of s.matchAll(SLOT)) if (m[1]) out.add(m[1]);
  };
  if (typeof p === 'string') scan(p);
  else {
    scan(p.other);
    if (p.one) scan(p.one);
  }
  return out;
}

export function checkTranslations(): string[] {
  const problems: string[] = [];
  const source = FLAT.vi;

  for (const locale of Object.keys(FLAT) as Locale[]) {
    if (locale === 'vi') continue;
    for (const [key, phrase] of Object.entries(FLAT[locale])) {
      const want = source[key];
      if (want === undefined) continue; // tsc đã chặn, không lặp lại việc
      const allowed = slotsOf(want);
      for (const slot of slotsOf(phrase)) {
        if (!allowed.has(slot)) {
          problems.push(`[${locale}] ${key}: có {${slot}} mà bản gốc không có`);
        }
      }
    }
  }
  return problems;
}
