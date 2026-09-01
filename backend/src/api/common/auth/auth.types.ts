/**
 * Người đang gọi, sau khi cổng thẻ đã mở ra và kiểm xong.
 *
 * Cố tình gầy. Cần tên hay ảnh thì đi hỏi bảng — nhét vào thẻ là nhét một bản
 * sao sẽ cũ đi, và mỗi lần đổi tên lại có một khoảng thời gian thẻ nói sai.
 */
export interface AuthUser {
  /** id người dùng */
  id: string;
  /** id phiên — thu hồi được từng máy một */
  sessionId: string;
}

/** Vài thứ về cái máy đang đăng nhập. App gửi lên, có thì tốt, không có cũng chạy. */
export interface DeviceInfo {
  deviceName?: string | null;
  platform?: string | null;
  appVersion?: string | null;
  ip?: string | null;
}
