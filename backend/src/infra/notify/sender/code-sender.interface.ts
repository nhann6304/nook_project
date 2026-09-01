import type { SignInMethod } from '@nook/shared';

/**
 * Một cách mang mã 6 số tới tay người dùng.
 *
 * Tách ra thành giao diện vì đường đi sẽ đổi: hôm nay in ra log, mai gửi email
 * thật, mốt thêm SMS của một nhà mạng nào đó. Chỗ gọi không cần biết.
 */
export interface CodeSender {
  /** Tên để ghi log. */
  readonly kind: string;
  send(method: SignInMethod, target: string, code: string): Promise<void>;
}
