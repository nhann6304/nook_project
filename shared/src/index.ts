/**
 * @nook/shared — hợp đồng giữa app và server.
 *
 * ── Xếp theo MIỀN, không theo loại tệp ──────────────────────────────────────
 *
 *   http/          hợp đồng vận chuyển: đường dẫn, mã HTTP, vỏ câu trả lời
 *   auth/          đăng nhập, mã 6 số, thẻ phiên
 *   user/          hồ sơ
 *   circle/        góc bạn bè, sức chứa, mốc cấp thân
 *   achievement/   thành tích và con đếm
 *   memory/        ký ức: trần theo ngày, khoá ngày theo giờ người dùng
 *   realtime/      tên đường và tên sự kiện của ống socket
 *   catalog/       gộp mảnh từ các miền: ERR · MSG · LIMITS
 *
 * Vì sao không xếp theo `constant/ type/ util/`: xếp kiểu đó thì một tính năng
 * nằm rải ở ba thư mục, và **không tách ra được**. Ngày nào `circle` cần thành
 * gói riêng thì chỉ việc bê nguyên thư mục đi. Với cách cũ thì phải bóc từng
 * dòng ra khỏi năm tệp chung.
 *
 * Trong mỗi miền, loại nằm ở TÊN TỆP: `auth.constant.ts` · `auth.type.ts` ·
 * `auth.util.ts` · `auth.error.ts` · `auth.message.ts`.
 *
 * ── Ba luật ─────────────────────────────────────────────────────────────────
 *
 * 1. `dependencies` phải luôn RỖNG. Gói này đi vào bản app trên điện thoại.
 * 2. Không bí mật, không luật tính toán. Người ta mở được file `.apk` ra đọc.
 * 3. Type là type, không phải bộ kiểm. Backend buộc DTO khớp bằng `implements`.
 */
export * from './http/index.js';
export * from './auth/index.js';
export * from './user/index.js';
export * from './circle/index.js';
export * from './achievement/index.js';
export * from './memory/index.js';
export * from './realtime/index.js';
export * from './catalog/index.js';
