/**
 * `model/` — nghiệp vụ Nook, xếp theo LOẠI hệt như `common/`.
 *
 * Miền (`auth`, `user`, `circle`…) là thư mục con BÊN TRONG mỗi loại, không
 * phải tầng ngoài: `interface/auth/`, `type/auth/`, `constant/auth/`. Bốn loại
 * đứng ngang cấp nhau ở mọi tầng của cây, nên chỗ đặt một tệp mới chỉ còn một
 * câu hỏi — nó là loại gì — chứ không phải hai.
 *
 * `catalog/` không phải một miền mà là BẢN GỘP của mọi miền (`ERR`, `MSG`,
 * `LIMITS`). Nó nằm ở `model/` chứ không ở `common/` vì nó nhập từ mọi miền —
 * để bên `common/` là bắt tầng dưới nhập lên tầng trên.
 */
export * from './constant/index.js';
export * from './interface/index.js';
export * from './type/index.js';
export * from './util/index.js';
