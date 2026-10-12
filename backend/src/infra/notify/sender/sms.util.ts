import { LIMITS } from '@nook/shared';

/** Nhà mạng chậm thì thôi, đừng giữ yêu cầu của người dùng mãi. */
export const SMS_TIMEOUT_MS = 8_000;

/**
 * Tên app trong tin nhắn. Tin brandname ở Việt Nam phải KHỚP mẫu đã đăng ký
 * với nhà mạng — đổi chữ ở đây là phải đăng ký lại mẫu, không thì tin bị chặn.
 */
const SMS_APP_NAME = 'LOVO';

/**
 * Nội dung tin: ASCII, không dấu. Tin có dấu đi kiểu Unicode — 70 ký tự một
 * tin thay vì 160, tức là trả gấp đôi — và mẫu brandname đăng ký không dấu.
 *
 * Số phút CỐ ĐỊNH theo `codeTtlSeconds`, kể cả khi gửi lại mã cũ còn ít phút
 * hơn (thư thì hiện số thật): câu này phải khớp mẫu brandname đã đăng ký.
 */
export function smsCodeText(code: string): string {
  const minutes = Math.round(LIMITS.codeTtlSeconds / 60);
  return `${code} la ma dang nhap ${SMS_APP_NAME}. Ma het han sau ${minutes} phut. Khong chia se ma nay.`;
}

export { maskPhone } from './mask.util.js';

/** Câu báo lỗi của nhà mạng có thể có dấu — log server chỉ được ASCII. */
export function toAsciiLog(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^\x20-\x7e]/g, '?')
    .slice(0, 200);
}
