import type { TSignInIntent, TSignInMethod } from '@nook/shared';

/** Thứ đi kèm mã để chọn chữ trong thư. SMS bỏ qua cả hai. */
export interface ICodeSendMeta {
  /** Cửa người dùng bấm vào — chọn tiêu đề và lời dẫn của thư. */
  intent?: TSignInIntent;
  /**
   * Mã còn sống bao nhiêu giây. Gửi lại mã cũ thì nhỏ hơn `codeTtlSeconds` —
   * thư phải nói đúng số phút còn lại. Bỏ trống = trọn `codeTtlSeconds`.
   */
  ttlSeconds?: number;
}

/**
 * Một cách mang mã 6 số tới tay người dùng.
 *
 * Tách ra thành giao diện vì đường đi sẽ đổi: hôm nay in ra log, mai gửi email
 * thật, mốt thêm SMS của một nhà mạng nào đó. Chỗ gọi không cần biết.
 */
export interface ICodeSender {
  /** Tên để ghi log. */
  readonly kind: string;
  send(method: TSignInMethod, target: string, code: string, meta?: ICodeSendMeta): Promise<void>;
}
