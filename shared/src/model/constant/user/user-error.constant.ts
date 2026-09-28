/**
 * Tên khoá mang sẵn tiền tố miền (`USER_`) là cố ý: mấy bảng này bị GỘP lại
 * thành `ERR` ở `catalog/`, mà gộp thì khoá nằm chung một mặt phẳng. Đặt trùng
 * là bảng sau đè bảng trước, im lặng.
 *
 * Có chốt biên dịch bắt chuyện đó — xem `catalog/error.catalog.ts`.
 */
export const USER_ERR = {
  USER_NOT_FOUND: 'user.not_found',
  /** Tên hiển thị rỗng, quá dài, hoặc toàn khoảng trắng */
  NAME_INVALID: 'user.name_invalid',
} as const;
