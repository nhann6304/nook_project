/**
 * @nook/shared — hợp đồng giữa app và server.
 *
 * ── TẦNG ở ngoài, LOẠI ở giữa, MIỀN ở trong ─────────────────────────────────
 *
 *   src/
 *   ├── common/            không thuộc bảng nào — xoá sạch Nook đi vẫn còn nghĩa
 *   │   ├── constant/      http/ · realtime/
 *   │   ├── interface/     http/ · record/
 *   │   ├── type/          http/
 *   │   └── util/          http/
 *   └── model/             nghiệp vụ Nook
 *       ├── constant/      auth/ · user/ · circle/ · media/ · memory/ ·
 *       │                  achievement/ · catalog/
 *       ├── interface/     auth/ · user/ · circle/ · media/ · achievement/
 *       ├── type/          auth/ · user/ · media/ · achievement/ · catalog/
 *       └── util/          auth/ · user/ · circle/ · memory/
 *
 * **Bốn loại đứng NGANG CẤP nhau, ở cả hai tầng.** Miền là thư mục con bên
 * trong loại, không phải tầng ngoài — `interface/auth/` chứ không phải
 * `auth/interface/`. Nhờ vậy đặt một tệp mới chỉ còn MỘT câu hỏi ("nó là loại
 * gì"), và mở `interface/` ra là thấy đủ mọi hình dạng dữ liệu của hệ thống
 * cạnh nhau chứ không phải mở bảy thư mục.
 *
 * ── Hai câu hỏi, theo thứ tự ────────────────────────────────────────────────
 *
 * 1. **Xoá sạch Nook đi thì nó còn nghĩa không?** Vỏ câu trả lời, con trỏ lật
 *    trang, mã HTTP — còn nghĩa, nên `common/`. Mốc cấp thân, số chỗ trong góc,
 *    luật tên riêng — hết nghĩa, nên `model/`.
 * 2. **Nó là loại gì?**
 *
 *      constant/   hằng số, giới hạn, danh sách, mã lỗi, mã thông báo
 *      interface/  tả một hình dạng dữ liệu             → tên bắt đầu bằng `I`
 *      type/       ghép hoặc suy ra từ hình dạng có sẵn → tên bắt đầu bằng `T`
 *      util/       hàm thuần
 *
 * ── Ba luật của cây, `npm run check:layer` soi cả ba ────────────────────────
 *
 *   · `common/` KHÔNG được nhập từ `model/`. Chiều ngược lại thoải mái.
 *   · **Cùng loại thì nhập THẲNG tệp; đổi loại thì đi qua `index.js` của loại.**
 *     Không phải làm cho đẹp: `constant/catalog/` gộp từ `constant/auth/`,
 *     `constant/user/`… mà đi qua `constant/index.js` thì nó tự nhập vào chính
 *     mình — vòng tròn, và `{...AUTH_ERR}` chạy trúng lúc `AUTH_ERR` chưa có
 *     giá trị. Đổi loại thì an toàn vì mấy đường đó đều là `import type`, biến
 *     mất lúc dịch.
 *   · Barrel CHỈ có ở tầng loại — 11 cái `index.ts` cho 43 tệp thật. Đẻ thêm
 *     barrel cho từng miền là thành `apis/` ngày xưa: 39 `index.ts` trên 84 tệp,
 *     tìm code phải lội qua mấy tầng rỗng.
 *
 * ── `interface` hay `type` ──────────────────────────────────────────────────
 *
 *   interface  tả MỘT hình dạng            IUserProfile, IAuthTokens
 *   type       ghép/suy ra hình dạng khác  TApiResponse = IApiEnvelope | IApiError
 *                                          TSignInMethod = (typeof SIGNIN_METHODS)[number]
 *
 * Tiền tố `I`/`T` là bắt buộc, và tên tệp phải nói loại: `user.interface.ts`,
 * `auth.type.ts`, `circle.constant.ts`, `memory.util.ts`. Bộ soi bắt tệp nằm
 * dưới `interface/` mà không đặt tên `*.interface.ts`.
 *
 * ── Ba luật của gói ─────────────────────────────────────────────────────────
 *
 * 1. `dependencies` phải luôn RỖNG. Gói này đi vào bản app trên điện thoại.
 * 2. Không bí mật, không luật tính toán. Người ta mở được file `.apk` ra đọc.
 * 3. Type là type, không phải bộ kiểm. Backend buộc DTO khớp bằng `implements`.
 */
export * from './common/index.js';
export * from './model/index.js';
