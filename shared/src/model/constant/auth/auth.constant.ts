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

/**
 * Người dùng bấm vào từ màn nào.
 *
 * Giao diện có HAI cửa: "đã có tài khoản" và "tạo tài khoản mới". Cùng gọi một
 * đường `POST /v1/auth/code`, khác nhau đúng ở chữ này — để server biết lúc
 * nào phải nói "email này chưa có ai dùng" thay vì lặng lẽ gửi mã đi.
 *
 * Bỏ trống cũng được: khi đó server không soi, gửi mã cho cả hai trường hợp —
 * dành cho màn một-ô-duy-nhất nếu sau này gộp lại.
 */
export const SIGNIN_INTENTS = ['signin', 'signup'] as const;

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
  /**
   * Trần số mã xin được trong một giờ, tính theo một ĐỊA CHỈ MÁY.
   *
   * Trần bên trên khoá theo email nên không cản được người gõ mỗi lần một
   * email khác — mà từ lúc cửa này biết nói "email chưa có tài khoản", gõ liên
   * tục chính là cách quét ra danh sách ai đang dùng Nook. Trần này mới là cái
   * chặn. Để rộng tay: một nhà chung Wi-Fi, mấy người cùng mở app là bình
   * thường; kẻ quét thì vượt xa con số này.
   */
  codesPerHourPerIp: 30,
} as const;
