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
 *
 * Server cũng đọc chính nó: xin mã qua một đường chưa mở thì bị từ chối bằng
 * `auth.method_unavailable`, chứ không phải một lỗi chung chung khó hiểu.
 */
export const SIGNIN_METHODS = ['email', 'phone'] as const;

/** Số điện thoại còn chờ chọn nhà mạng gửi SMS. */
export const SIGNIN_METHODS_ENABLED = ['email'] as const;

export type SignInMethod = (typeof SIGNIN_METHODS)[number];
export type EnabledSignInMethod = (typeof SIGNIN_METHODS_ENABLED)[number];

export function isSignInMethodEnabled(method: SignInMethod): method is EnabledSignInMethod {
  return (SIGNIN_METHODS_ENABLED as readonly string[]).includes(method);
}
