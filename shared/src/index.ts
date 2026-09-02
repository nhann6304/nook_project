/**
 * @nook/shared — hợp đồng giữa app và server.
 *
 * ── Xếp theo MIỀN, trong miền xếp theo LOẠI ─────────────────────────────────
 *
 *   <miền>/constant/   hằng số, giới hạn, danh sách, mã lỗi, mã thông báo
 *   <miền>/interface/  tả một hình dạng dữ liệu        → tên bắt đầu bằng `I`
 *   <miền>/type/       ghép hoặc suy ra từ hình dạng có sẵn → tên bắt đầu bằng `T`
 *   <miền>/util/       hàm thuần
 *
 * Chín miền: http · auth · user · circle · achievement · memory · realtime ·
 * record · catalog.
 *
 * Vì sao xếp theo miền chứ không theo loại ở tầng ngoài: xếp theo loại thì một
 * tính năng nằm rải khắp nơi và **không tách ra được**. Ngày nào `circle` cần
 * thành gói riêng thì bê nguyên thư mục đi là xong.
 *
 * ── `interface` hay `type` ──────────────────────────────────────────────────
 *
 *   interface  tả MỘT hình dạng            IUserProfile, IAuthTokens
 *   type       ghép/suy ra hình dạng khác  TApiResponse = IApiEnvelope | IApiError
 *                                          TSignInMethod = (typeof SIGNIN_METHODS)[number]
 *
 * Tiền tố `I`/`T` là bắt buộc, và tên tệp phải nói loại: `user.interface.ts`,
 * `auth.type.ts`, `circle.constant.ts`, `memory.util.ts`.
 *
 * ── Ba luật ─────────────────────────────────────────────────────────────────
 *
 * 1. `dependencies` phải luôn RỖNG. Gói này đi vào bản app trên điện thoại.
 * 2. Không bí mật, không luật tính toán. Người ta mở được file `.apk` ra đọc.
 * 3. Type là type, không phải bộ kiểm. Backend buộc DTO khớp bằng `implements`.
 */
export * from './record/index.js';
export * from './http/index.js';
export * from './auth/index.js';
export * from './user/index.js';
export * from './circle/index.js';
export * from './achievement/index.js';
export * from './memory/index.js';
export * from './media/index.js';
export * from './realtime/index.js';
export * from './catalog/index.js';
