/**
 * @nook/shared — hợp đồng giữa app và server.
 *
 * Ba thư mục, không hơn:
 *   constant/  đường dẫn API, mã lỗi, giới hạn, mốc cấp, tên sự kiện socket
 *   type/      hình dạng dữ liệu đi qua dây
 *   util/      hàm thuần hai bên dùng y hệt nhau
 *
 * Luật: `dependencies` phải luôn rỗng. Gói này đi vào bản app trên điện thoại.
 */
export * from './constant/index.js';
export * from './type/index.js';
export * from './util/index.js';
