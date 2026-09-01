# Frontend — bản đồ tài liệu

Tài liệu **riêng của app**. Thứ mà cả backend cũng cần thì nằm ở
[`../../.docs/`](../../.docs/), không nằm ở đây.

## Đọc theo thứ tự nào

| Bạn định làm gì | Đọc |
|---|---|
| **Code giao diện** | [`../../.claude/skills/nook-ui/SKILL.md`](../../.claude/skills/nook-ui/SKILL.md) — bản rút gọn làm theo được ngay của `01` + `02` + `08` |
| Mới vào dự án | [`../../.docs/01-product-system.md`](../../.docs/01-product-system.md) → [`07-architecture.md`](07-architecture.md) → [`02-ui-system.md`](02-ui-system.md) |
| Chạy thử app | [`../README.md`](../README.md) |

## Thiết kế

| File | Lo việc gì | Tìm ở đây khi |
|---|---|---|
| [`01-brand.md`](01-brand.md) | Logo, app icon, màu, kiểu chữ | Cần một mã màu, một cỡ chữ, hay dựng lại logo |
| [`02-ui-system.md`](02-ui-system.md) | Nguyên tắc giao diện, điều hướng, chuyển động, chữ nghĩa, luật hai nền tảng | Đang dựng một màn mới |
| [`03-screen-specs.md`](03-screen-specs.md) | Đặc tả 18 màn hình | Cần biết màn đó có gì trên đó |
| [`04-widget.md`](04-widget.md) | Widget màn hình chính | Làm widget |
| [`05-scope.md`](05-scope.md) | Bảng chức năng: xong / chưa | Muốn biết còn bao nhiêu việc |

## Kỹ thuật

| File | Lo việc gì | Tìm ở đây khi |
|---|---|---|
| [`06-libraries.md`](06-libraries.md) | Mọi gói đã cài: bản, lý do, giá phải trả. Cả gói **đã cân nhắc rồi bỏ** | Định thêm thư viện, hoặc thắc mắc gói này vào đây làm gì |
| [`07-architecture.md`](07-architecture.md) | Cây thư mục, ba đường không được cắt qua, đặt file mới ở đâu | Không biết thứ mình sắp viết để chỗ nào |
| [`08-performance.md`](08-performance.md) | Bảy luật giữ app mượt, chỗ đã tính trước, cách tự đo | Sắp viết animation / danh sách, hoặc thấy có chỗ giật |
| [`09-i18n.md`](09-i18n.md) | Hai thứ tiếng: thêm câu chữ thế nào, số nhiều, lưới an toàn | Sắp viết bất kỳ chữ nào hiện cho người dùng |
| [`10-theme.md`](10-theme.md) | Năm bảng màu người dùng chọn được, cách lấy màu, ngưỡng tương phản | Sắp dùng bất kỳ màu nào |

## Code — bốn chỗ hay tìm nhất

| Đường dẫn | Nội dung |
|---|---|
| `src/design/palettes.ts` | Năm bảng màu, kèm số đo tương phản. **Nơi duy nhất được viết mã màu** |
| `src/design/tokens.ts` | Khoảng cách / bo góc / cỡ chữ / nhịp — thứ KHÔNG đổi theo bảng màu |
| `src/components/index.ts` | Danh sách mảnh có sẵn — xem trước khi định tự dựng cái mới |
| `src/i18n/locales/vi.ts` | Toàn bộ chữ hiện cho người dùng. **Nơi duy nhất được viết câu tiếng Việt** |
| `src/features/<tên>/screens/` | Từng màn một, tên khớp với [`03-screen-specs.md`](03-screen-specs.md) |
| `eslint.config.js` | Lưới chặn: hex, style trong lúc vẽ, primitive thô, chữ viết thẳng |
