import type { MEDIA_KINDS, MEDIA_STATUSES, MEDIA_VARIANTS } from '../../constant/index.js';

/** Ảnh này dùng vào việc gì. Quyết định ai được xem, xem mục `IMedia`. */
export type TMediaKind = (typeof MEDIA_KINDS)[number];

/**
 * Đời của một tấm ảnh:
 *
 *   pending  đã xin đường tải lên, chưa thấy tệp trong kho
 *   ready    tệp đã có thật, kích thước khớp với lúc khai
 *   failed   xin rồi bỏ, hoặc tải lên hỏng
 *
 * Có `pending` vì bytes KHÔNG đi qua server: app tải thẳng lên kho, nên giữa
 * lúc xin đường và lúc tệp có thật là một khoảng mà server không biết gì.
 */
export type TMediaStatus = (typeof MEDIA_STATUSES)[number];

/**
 * Bản nào của một tấm ảnh.
 *
 * `undefined` nghĩa là **bản gốc** — và bản gốc luôn có, luôn nguyên vẹn. Bản
 * nhẹ có thể chưa dựng xong (dựng ở việc nền), lúc đó server trả bản gốc thay
 * vì trả lỗi: chậm một lần còn hơn ô ảnh trống.
 */
export type TMediaVariant = (typeof MEDIA_VARIANTS)[number];
