/**
 * Header app gắn vào MỌI lệnh gọi để server biết máy nào đang gọi.
 *
 * Header chứ không nằm trong body: đăng nhập, tạo tài khoản, làm mới thẻ đều
 * cần, và một chỗ gắn (`lib/http/api.ts`) thì không cửa nào quên được.
 * Server KHÔNG tin chúng để cấp quyền — chỉ để nhận ra máy lạ và ghi dấu vết.
 */
export const HEADER = {
  /** UUID app tự sinh một lần, cất trong SecureStore. Cài lại app là máy mới. */
  deviceId: 'x-device-id',
  /** "iPhone 15 Pro", "Pixel 8". */
  deviceModel: 'x-device-model',
  /** "ios 18.2", "android 15". */
  deviceOs: 'x-device-os',
  appVersion: 'x-app-version',
} as const;

/** Trần độ dài mỗi header thiết bị — server cắt bớt phần thừa. */
export const DEVICE_HEADER_MAX = 64;
