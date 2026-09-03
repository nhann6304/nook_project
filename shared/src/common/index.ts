/**
 * `common/` — thứ KHÔNG thuộc bảng nào.
 *
 * Vỏ câu trả lời, đường dẫn, mã HTTP, con trỏ lật trang, mấy mảnh mà bản ghi
 * nào cũng có, tên sự kiện của ống realtime. Xoá sạch nghiệp vụ Nook đi thì cả
 * thư mục này vẫn còn nguyên và vẫn chạy.
 *
 * **Luật một chiều: `common/` KHÔNG được nhập từ `model/`.** Nó là tầng dưới.
 * Có `npm run check:layer` soi — không có bộ soi thì luật chỉ nằm trong tài
 * liệu, và tài liệu thì mục.
 */
export * from './constant/index.js';
export * from './interface/index.js';
export * from './type/index.js';
export * from './util/index.js';
