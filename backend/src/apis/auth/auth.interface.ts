/**
 * Hình dạng riêng của phần đăng nhập.
 *
 * `IAuthUser` (người đang gọi) KHÔNG ở đây mà ở `core/interface/` — xem ghi chú
 * trong tệp đó. Chỗ này chỉ giữ thứ mà chỉ mình phần đăng nhập cần.
 */
/** Vài thứ về cái máy đang đăng nhập. App gửi lên, có thì tốt, không có cũng chạy. */
export interface IDeviceInfo {
  deviceName?: string | null;
  platform?: string | null;
  appVersion?: string | null;
  ip?: string | null;
}
