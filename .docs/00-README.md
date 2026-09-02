# Nook — bản đồ tài liệu

Tài liệu chia theo **nơi nó thuộc về**, không đổ chung một chỗ.

```
.docs/                ← ở đây. Tài liệu CHUNG, cả hai bên đều đọc.
frontend/docs/        ← tài liệu riêng của app
backend/docs/         ← tài liệu riêng của server (chưa có)
```

Luật: một tài liệu lo đúng một việc, và nằm đúng một chỗ. Thấy mình phải sửa hai
file cho cùng một thay đổi nghĩa là chia sai — nói ra để chia lại, đừng chép
nội dung sang cả hai.

## Tài liệu chung — ở thư mục này

| File | Lo việc gì | Ai cần |
|---|---|---|
| [`01-product-system.md`](01-product-system.md) | Hệ thống sản phẩm: đơn vị "ký ức", cấp thân 1–10, chống farm, quyền vị trí, roadmap V0.1→V0.4 | **Cả hai bên.** Backend hiện thực phần lớn luật trong này |
| [`02-release-checklist.md`](02-release-checklist.md) | Việc phải xong trước khi lên App Store / Play Store | Cả hai bên |
| [`03-offline.md`](03-offline.md) | Mất mạng thì xem được gì, làm được gì, lên mạng lại thì kéo về ra sao | **Cả hai bên.** Ghi trước khi code — chưa có dòng mã nào theo nó |

**Đọc `01-product-system.md` mục 0 và mục 3 trước tiên** — đó là triết lý gốc
quyết định mọi thứ khác.

## Frontend — [`../frontend/docs/`](../frontend/docs/)

| File | Lo việc gì |
|---|---|
| [`00-README.md`](../frontend/docs/00-README.md) | Bản đồ tài liệu frontend |
| [`01-brand.md`](../frontend/docs/01-brand.md) | Logo "Ôm", app icon, bảng màu song sắc, kiểu chữ |
| [`02-ui-system.md`](../frontend/docs/02-ui-system.md) | Nguyên tắc giao diện, điều hướng, chuyển động, chữ nghĩa |
| [`03-screen-specs.md`](../frontend/docs/03-screen-specs.md) | Đặc tả 18 màn hình |
| [`04-widget.md`](../frontend/docs/04-widget.md) | Widget màn hình chính (iOS + Android) |
| [`05-scope.md`](../frontend/docs/05-scope.md) | Bảng chức năng: cái gì xong, cái gì chưa |
| [`06-libraries.md`](../frontend/docs/06-libraries.md) | Mọi gói đã cài: bản nào, vì sao, giá phải trả — và những gói **đã cân nhắc rồi bỏ** |
| [`07-architecture.md`](../frontend/docs/07-architecture.md) | Cây thư mục, ba đường không được cắt qua |
| [`08-performance.md`](../frontend/docs/08-performance.md) | Bảy luật giữ app mượt |

Kèm theo: [`.claude/skills/nook-ui/SKILL.md`](../.claude/skills/nook-ui/SKILL.md)
— luật dựng giao diện, **đọc trước khi gõ dòng `.tsx` đầu tiên**.

## Backend — chưa viết

Chỗ đã dành sẵn ở [`../backend/`](../backend/). Xem
[`../backend/README.md`](../backend/README.md) để biết dự kiến có gì và ranh giới
với frontend nằm ở đâu.
