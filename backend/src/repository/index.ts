/**
 * Kho dữ liệu — xếp theo BẢNG, không theo khán giả.
 *
 * Chỗ này cố ý nằm NGOÀI `api/`: app React Native và web quản trị hỏi cùng một
 * bảng `users`, chỉ khác nhau ở chỗ được thấy gì và làm được gì. Nhét kho vào
 * thư mục của một trong hai khán giả là để bên kia phải với sang — và cái với
 * sang đó là chỗ cây thư mục bắt đầu rối.
 *
 * Cái KHÁC nhau giữa hai khán giả nằm ở controller, dto và mapper. Cái GIỐNG
 * nhau — câu truy vấn — nằm ở đây.
 */
export * from './user/index.js';
export * from './session/index.js';
export * from './achievement/index.js';
export * from './media/index.js';
export * from './repository.module.js';
