# Nook — ngữ cảnh dự án cho Claude Code

App xã hội "Locket + Friendship RPG": camera-first, góc 10 người bạn, độ thân
biến thành hệ tiến trình nhưng không dùng điểm/nhiệm vụ mà dùng một đơn vị duy
nhất là **"ký ức"** — tương tác hai chiều thật giữa hai người.

## Cây dự án — tìm đúng chỗ trước khi làm gì

```
nook_project/
├── .docs/        tài liệu CHUNG (sản phẩm, danh sách trước khi lên store) — thư mục ẩn
├── frontend/     app React Native (Expo). ĐANG LÀM. Có CLAUDE.md riêng.
├── backend/      server. CHƯA BẮT ĐẦU. Có README nói ranh giới.
└── .claude/skills/nook-ui/   luật dựng giao diện
```

**Đang sửa app?** Đọc [`frontend/CLAUDE.md`](frontend/CLAUDE.md) — mọi luật kỹ
thuật và giao diện nằm ở đó, không nằm ở file này.

**Đang bắt đầu backend?** Đọc [`backend/README.md`](backend/README.md) trước.

## Luật chung cho cả hai bên

- **Không đổ file ra gốc.** Mã nguồn đi vào `frontend/` hoặc `backend/`.
  Gốc chỉ có: `README.md`, `CLAUDE.md`, `.gitignore`, và ba thư mục trên.
- **Tài liệu nằm đúng nơi nó thuộc về.** Cả hai bên cùng cần → `.docs/`.
  Chỉ một bên cần → `frontend/docs/` hoặc `backend/docs/`.
- **Ranh giới FE ↔ BE:** màn hình không biết server tồn tại. Mọi lệnh gọi mạng
  nằm trong `frontend/src/features/<tên>/lib/*Api.ts`. Hiện `authApi.ts` là hàng
  giả (mã đúng: `123456`). Nối backend = thay ruột file đó, không đụng màn hình.

## Luật sản phẩm không được phá — cả hai bên

Đầy đủ ở [`.docs/01-product-system.md`](.docs/01-product-system.md), **đọc mục 0
và mục 3 trước tiên**. Ba luật hay bị quên nhất:

- **Cấp thân chỉ hai người trong cặp nhìn thấy.** Không API nào trả cấp thân của
  người khác cho người thứ ba.
- **Không bảng xếp hạng, không số like công khai.**
- Ba từ **cấm** trong chữ hiện cho người dùng: *điểm*, *hạng*, *nhiệm vụ*.
  Không chữ kỹ thuật ("OTP", "xác thực", "hợp lệ", "token", "session").

## Trạng thái

| Phần | Trạng thái |
|---|---|
| Frontend | **Chạy được.** `cd frontend && npm run dev` rồi quét QR bằng Expo Go. Ghim **SDK 54** vì Expo Go trên App Store kẹt ở đó — đừng nâng, xem `frontend/docs/06-libraries.md` mục 7 |
| Backend | Chưa có dòng nào |
| Tài liệu | 13 file, đã chia theo hai bên |

Việc tiếp theo của FE: màn **Tên + ảnh** để đi hết một lượt onboarding.
Việc cần quyết sớm: **có chuyển sang development build không** — widget cần nó,
và chuyển giữa chừng là đổi cả cách chạy dự án.
