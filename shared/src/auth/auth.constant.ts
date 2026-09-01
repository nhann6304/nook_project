/**
 * Đăng nhập bằng đường nào — và đường nào ĐANG mở.
 *
 * Hai danh sách chứ không phải một, cố ý:
 *
 *   SIGNIN_METHODS          mọi đường sản phẩm dự tính có
 *   SIGNIN_METHODS_ENABLED  đường đang thật sự dùng được lúc này
 *
 * App đọc danh sách thứ hai để biết nên vẽ mấy cái nút. Mở thêm SMS sau này là
 * thêm một chữ vào đây, không phải đi sửa màn hình.
 */
export const SIGNIN_METHODS = ['email', 'phone'] as const;

/** Số điện thoại còn chờ chọn nhà mạng gửi SMS. */
export const SIGNIN_METHODS_ENABLED = ['email'] as const;

/** Luật của mã 6 số. App chặn trước cho đỡ phí một vòng mạng; server chặn thật. */
export const AUTH_LIMITS = {
  /** Độ dài mã đăng nhập */
  codeLength: 6,
  /** Mã sống được bao lâu */
  codeTtlSeconds: 300,
  /** Sai tối đa mấy lần trước khi mã bị huỷ */
  codeMaxTries: 5,
  /** Phải chờ bao lâu mới được xin mã lần nữa */
  codeResendSeconds: 60,
  /** Trần số mã xin được trong một giờ, tính theo một đích */
  codesPerHour: 5,
} as const;
