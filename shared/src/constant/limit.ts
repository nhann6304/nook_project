/**
 * Giới hạn — cả hai bên phải đọc cùng một con số.
 *
 * App dùng để chặn trước cho đỡ phí một vòng mạng; server dùng làm luật thật.
 * App chặn là để lịch sự, server chặn mới là chặn.
 */
export const LIMITS = {
  /** Số chỗ trong góc khi mới mở tài khoản */
  circleBase: 10,
  /** Trần tuyệt đối, dù mở khoá được bao nhiêu thành tích đi nữa */
  circleMax: 35,

  /** Số ký ức tối đa tính được với MỘT người trong MỘT ngày — chống cày */
  memoriesPerDay: 3,
  /** Không tương tác bao nhiêu ngày thì cặp bạn coi như ngủ đông */
  dormantAfterDays: 30,

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

  /** Tên hiển thị */
  displayNameMin: 1,
  displayNameMax: 24,
} as const;
