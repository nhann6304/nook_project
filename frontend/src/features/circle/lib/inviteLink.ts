/**
 * Link mời / link tài khoản — HÀNG GIẢ. Khi có server thì lấy link thật (link
 * mời hạn 7 ngày) từ API; app chỉ cần đổi ruột tệp này.
 */
export const INVITE_LINK = 'https://lovo.app/i/demo';

/** Link trang của mình — nằm trong mã QR. Người kia quét là mở trang thêm bạn. */
export function profileLink(username: string | null): string {
  return `https://lovo.app/u/${username ?? 'me'}`;
}
