/**
 * Hằng số chỉ server cần — không nhét vào `@nook/shared` (gói đó vào bản app).
 */

/** Mã sticker: chữ thường, số, `_ . : -` ngăn giữa. Bộ sticker nằm ở app; server chỉ soi dạng. */
export const STICKER_CODE = /^[a-z0-9]+(?:[._:-][a-z0-9]+)*$/;
export const STICKER_CODE_MAX = 64;

/**
 * Một socket báo "đang gõ" cho một cuộc dày nhất bấy nhiêu. App tự giữ 3 giây
 * (`CHAT_SOCKET_IN.typing`); chốt này chỉ chặn máy hỏng hoặc kẻ phá.
 */
export const TYPING_MIN_INTERVAL_MS = 1000;
