/**
 * Kiểu của bộ chữ. Đây là chỗ làm cho i18n của Nook an toàn lúc BIÊN DỊCH chứ
 * không phải lúc chạy.
 *
 * Ba thứ tsc bắt được nhờ file này, mà thư viện i18n thông thường chỉ bắt được
 * khi app đã chạy tới đúng màn đó:
 *
 *   1. Gõ sai khoá  — t('camra.title') là lỗi đỏ ngay trong editor.
 *   2. Thiếu bản dịch — `en` phải khớp từng khoá với `vi`, thiếu một khoá là
 *      không biên dịch được. Không có chuyện app chạy ra chữ tiếng Việt lẫn
 *      trong bản tiếng Anh.
 *   3. Quên tham số — câu "Gửi lại sau {seconds} giây" mà gọi t() không truyền
 *      `seconds` cũng là lỗi đỏ. Đây là lỗi hay gặp nhất khi sửa câu chữ:
 *      thêm một chỗ trống vào câu rồi quên chỗ gọi.
 */

/**
 * Một câu có số nhiều.
 *
 * `other` bắt buộc, `one` tuỳ chọn — đúng theo CLDR cho hai ngôn ngữ này:
 * tiếng Việt KHÔNG đổi dạng theo số ("1 người bạn", "10 người bạn"), nên nó chỉ
 * khai `other`. Tiếng Anh có hai dạng nên khai cả hai.
 *
 * Bắt tiếng Việt phải viết `one` bằng đúng câu của `other` là chép thừa, và chỗ
 * chép thừa là chỗ sau này sửa một dòng quên dòng kia.
 */
export type Plural = { readonly one?: string; readonly other: string };

/** Một mẩu chữ: câu thường, hoặc câu có số nhiều. */
export type Phrase = string | Plural;

/** Bộ chữ là cây lồng nhau, lá là Phrase. */
export type Tree = { readonly [k: string]: Phrase | Tree };

/* ---------- Suy khoá phẳng từ cây ---------- */

/** { camera: { permission: { title } } } → 'camera.permission.title' */
export type Keys<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends Phrase ? `${P}${K}` : Keys<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Lấy Phrase nằm ở một khoá phẳng. */
export type At<T, K extends string> = K extends `${infer H}.${infer R}`
  ? H extends keyof T
    ? At<T[H], R>
    : never
  : K extends keyof T
    ? T[K]
    : never;

/* ---------- Suy tham số từ chính câu chữ ---------- */

/** 'Gửi lại sau {seconds} giây' → 'seconds' */
type Slots<S extends string> = S extends `${string}{${infer V}}${infer Rest}`
  ? V | Slots<Rest>
  : never;

/** Chỗ trống của một Phrase — với câu số nhiều thì gom cả hai dạng. */
type PhraseSlots<P> = P extends string
  ? Slots<P>
  : P extends Plural
    ? Slots<P['other']> | (P extends { readonly one: string } ? Slots<P['one']> : never)
    : never;

/** Câu số nhiều luôn cần `count`, kể cả khi câu không in con số ra. */
type NeedsCount<P> = P extends Plural ? (P extends string ? never : 'count') : never;

/** Tham số của một khoá. `{}` nếu câu không có chỗ trống nào. */
export type Vars<P> = {
  readonly [K in PhraseSlots<P> | NeedsCount<P>]: K extends 'count' ? number : string | number;
};

/**
 * Đối số thứ hai của t(): bắt buộc nếu câu có chỗ trống, cấm nếu không có.
 * Nhờ vế `[vars?: never]` mà t('common.back', { x: 1 }) cũng là lỗi — thừa
 * tham số thường có nghĩa là gọi nhầm khoá.
 */
export type Args<P> = [keyof Vars<P>] extends [never] ? [vars?: never] : [vars: Vars<P>];

/**
 * Khuôn cho bộ chữ dịch. `en` khai kiểu này chứ không khai `typeof vi`.
 *
 * Vì sao không dùng thẳng `typeof vi`: tiếng Việt không có số nhiều nên nó chỉ
 * khai `other`. Nếu `en` phải khớp y hệt thì tiếng Anh không thêm được `one` —
 * mà đó chính là thứ tiếng Anh cần. Khuôn này giữ NGUYÊN bộ khoá (thiếu một
 * khoá là không biên dịch được) nhưng nới lá số nhiều ra thành `Plural` đầy đủ.
 *
 * Cái nó KHÔNG bắt được: hai bản dùng tên chỗ trống khác nhau ({name} bên này,
 * {who} bên kia). Chỗ đó có lưới riêng — xem `assertSameSlots` trong catalog.ts,
 * chạy lúc phát triển.
 */
export type Mirror<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Plural
      ? Plural
      : Mirror<T[K]>;
};
