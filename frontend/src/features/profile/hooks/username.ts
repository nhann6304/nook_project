/**
 * Tên riêng (@tên): gợi ý từ tên hiện và soi DẠNG ngay trên máy.
 *
 * Cùng luật với server (`USERNAME_LIMITS`, `USERNAME_PATTERN` bên
 * `@nook/shared`): 3–20 ký tự, chỉ chữ không dấu, số, `.` và `_`. App soi để
 * sáng/tắt nút cho nhanh; còn trống hay không thì chỉ server trả lời được.
 */
import { fold } from '@/lib/text/fold';

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
const ALLOWED = /^[a-z0-9._]+$/;

export type UsernameProblem = 'short' | 'chars' | null;

/** "Nguyễn Văn Nam" → "nguyenvannam". */
export function suggestUsername(name: string): string {
  return fold(name)
    .replace(/[^a-z0-9._]/g, '')
    .slice(0, USERNAME_MAX);
}

/** Chuẩn hoá thứ người dùng gõ: bỏ "@", bỏ dấu, chữ thường. */
export function cleanUsername(raw: string): string {
  return fold(raw).replace(/\s+/g, '').slice(0, USERNAME_MAX);
}

export function usernameProblem(u: string): UsernameProblem {
  if (u.length < USERNAME_MIN) return 'short';
  if (!ALLOWED.test(u)) return 'chars';
  return null;
}
