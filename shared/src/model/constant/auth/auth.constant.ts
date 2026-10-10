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

/**
 * Số điện thoại mở ở đây nhưng server vẫn có thể đóng: `SMS_SENDER=off` thì
 * `phone` trả `auth.method_unavailable` (chỉ số Việt Nam, xem backend README).
 */
export const SIGNIN_METHODS_ENABLED = ['email', 'phone'] as const;

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
export const SIGNIN_INTENTS = ['signin', 'signup', 'reset'] as const;
// 'reset' (10/10/2026): xin mã để đặt lại mật khẩu — server soi như 'signin'
// (chưa có tài khoản thì trả `auth.account_not_found`, không gửi thư).

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
  /**
   * Trần số lần NỘP mã trong một giờ, tính theo một địa chỉ máy.
   *
   * Không phải để chống đoán mã — 5 lần sai là mã chết, đoán trúng 6 số trong
   * 5 lần là chuyện không xảy ra. Cái này bịt chỗ khác: `/auth/verify` là cửa
   * duy nhất không có trần nào, nên nó là chỗ bắn thoải mái. Rộng hơn trần xin
   * mã vì người thật gõ sai mã là bình thường.
   */
  verifyPerHourPerIp: 60,

  // — mật khẩu (10/10/2026) —
  /** Ngắn nhất. App sáng nút theo số này; server kiểm lại. */
  passwordMin: 8,
  /** Dài nhất — chặn chuỗi khổng lồ gửi vào để băm cho tốn CPU. */
  passwordMax: 128,
  /** Sai mật khẩu tối đa mấy lần cho MỘT tài khoản trước khi tạm khoá. */
  passwordMaxFails: 10,
  /** Tạm khoá bao lâu (giây) sau khi sai quá số lần trên. */
  passwordLockSeconds: 900,
  /** Trần số lần đăng nhập bằng mật khẩu trong một giờ, theo máy gọi. */
  loginPerHourPerIp: 60,
} as const;
