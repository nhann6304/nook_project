# Nook

App xã hội "Locket + Friendship RPG": camera-first, góc **10 người bạn**, độ thân
biến thành hệ tiến trình nhưng không dùng điểm/nhiệm vụ mà dùng một đơn vị duy
nhất là **"ký ức"** — tương tác hai chiều thật giữa hai người.

---

## Chạy thử trong 3 bước

```bash
cd frontend
npm ci             # đừng xoá package-lock.json — xem frontend/README.md
npm run dev
```

Rồi cài **Expo Go** trên điện thoại và **quét mã QR** hiện trong terminal.
Máy tính và điện thoại phải chung một mạng Wi-Fi.

- iPhone — [Expo Go trên App Store](https://apps.apple.com/app/expo-go/id982107779), quét bằng **Camera** có sẵn
- Android — [Expo Go trên Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent), quét **trong chính app Expo Go**

Không có điện thoại thì bấm `i` (mở máy giả lập iOS, cần Xcode) hoặc `a`
(máy giả lập Android, cần Android Studio) ngay trong terminal đang chạy.

**Mã đăng nhập giả để bấm thử: `123456`.** Chưa có server; mọi mã khác đều bị từ chối.

Hướng dẫn đầy đủ, gồm cả cách xử lý khi không quét được:
[`frontend/README.md`](frontend/README.md).

## Cây dự án

```
nook_project/
├── .docs/          tài liệu CHUNG — cả hai bên đều đọc (thư mục ẩn)
├── frontend/       app React Native (Expo) — ĐANG LÀM
├── backend/        server — CHƯA BẮT ĐẦU
├── .claude/        skill cho AI
└── CLAUDE.md       ngữ cảnh chung
```

| Thư mục | Nội dung | Trạng thái |
|---|---|---|
| [`.docs/`](.docs/) | Hệ thống sản phẩm, danh sách việc trước khi lên store | đang có |
| [`frontend/`](frontend/) | Toàn bộ app: mã nguồn, tài liệu FE, cấu hình, thư viện | **chạy được** |
| [`backend/`](backend/) | Server, cơ sở dữ liệu, API | chỗ đã dành sẵn, chưa có gì |

Ranh giới hai bên: **màn hình không biết server tồn tại.** Mọi lệnh gọi mạng nằm
trong `frontend/src/features/<tên>/lib/*Api.ts`. Hiện `authApi.ts` là hàng giả —
trả kết quả sau 700 mili giây. Ai làm backend chỉ thay ruột file đó, không đụng
vào một màn hình nào.

## Bắt đầu đọc từ đâu

| Bạn là | Đọc |
|---|---|
| Người mới vào dự án | [`.docs/00-README.md`](.docs/00-README.md) → [`.docs/01-product-system.md`](.docs/01-product-system.md) |
| Sắp code giao diện | [`.claude/skills/nook-ui/SKILL.md`](.claude/skills/nook-ui/SKILL.md) — **bắt buộc, đọc trước khi gõ** |
| Sắp làm backend | [`backend/README.md`](backend/README.md) |
