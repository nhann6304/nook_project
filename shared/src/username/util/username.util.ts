import {
  RESERVED_USERNAMES,
  USERNAME_ERR,
  USERNAME_LIMITS,
  USERNAME_PATTERN,
} from '../constant/index.js';
import type { TUsernameProblem } from '../type/index.js';

/** Dấu thanh và dấu phụ của Unicode. */
const DIACRITICS = /[̀-ͯ]/g;

/**
 * Đưa tên về DẠNG CHUẨN để so sánh.
 *
 * `NFKC` gộp mấy ký tự nhìn giống nhau mà mã khác nhau — chữ toàn phần, chữ
 * cách điệu — về một dạng. Không có nó thì người ta lấy được tên của nhau bằng
 * một ký tự Unicode trông y hệt.
 *
 * Bỏ dấu tiếng Việt luôn: `nám` và `nam` cùng ra `nam`, nên không ai lấy được
 * tên người khác bằng cách thêm một dấu sắc.
 */
export function normalizeUsername(raw: string): string {
  return raw
    .normalize('NFKC')
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim()
    .toLowerCase();
}

/**
 * Soi một cái tên — **chạy được ở CẢ app lẫn server**, và đó là cả điểm.
 *
 * Ở app: gọi ngay khi người ta gõ, **không tốn một vòng mạng nào**. Phần lớn
 * cái sai là sai dạng (quá ngắn, có khoảng trắng, có emoji) và bắt được hết ở
 * đây trong 0 mili giây. Chỉ khi tên đã đúng dạng mới đáng đi hỏi server xem
 * có ai lấy chưa.
 *
 * Ở server: gọi lại y hệt, vì app nói gì cũng không tin được.
 *
 * `null` nghĩa là dạng ổn — CHƯA phải là còn trống, cái đó chỉ server biết.
 */
export function checkUsernameShape(raw: string): TUsernameProblem {
  const key = normalizeUsername(raw);

  if (key.length < USERNAME_LIMITS.min || key.length > USERNAME_LIMITS.max) {
    return USERNAME_ERR.USERNAME_INVALID;
  }
  if (!USERNAME_PATTERN.test(key)) return USERNAME_ERR.USERNAME_INVALID;
  // Không mở đầu hay kết thúc bằng dấu, và không hai dấu liền nhau — `n..am`
  // với `n.am` nhìn giống nhau quá.
  if (/^[._]|[._]$|[._]{2}/.test(key)) return USERNAME_ERR.USERNAME_INVALID;

  if ((RESERVED_USERNAMES as readonly string[]).includes(key)) {
    return USERNAME_ERR.USERNAME_RESERVED;
  }
  return null;
}
