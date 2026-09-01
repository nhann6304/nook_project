# Nook — ngữ cảnh dự án cho Claude Code

App xã hội "Locket + Friendship RPG": camera-first, góc 10 người bạn, độ thân
biến thành hệ tiến trình nhưng không dùng điểm/nhiệm vụ mà dùng một đơn vị duy
nhất là **"ký ức"** — tương tác hai chiều thật giữa hai người.

## Cây dự án — tìm đúng chỗ trước khi làm gì

```
nook_project/
├── .docs/        tài liệu CHUNG (sản phẩm, danh sách trước khi lên store) — thư mục ẩn
├── shared/       @nook/shared — hợp đồng giữa app và server. KHÔNG PHỤ THUỘC.
├── frontend/     app React Native (Expo). Có CLAUDE.md riêng.
├── backend/      server NestJS trên Fastify. Khung chạy được. Có README riêng.
├── setup/        script `run` và `push`, mỗi cái một bản mac (.sh) và win (.bat)
├── package.json  workspace gom shared + backend. Frontend đứng riêng (Expo có luật gói riêng).
└── .claude/skills/nook-ui/   luật dựng giao diện
```

**Đang sửa app?** Đọc [`frontend/CLAUDE.md`](frontend/CLAUDE.md) — mọi luật kỹ
thuật và giao diện nằm ở đó, không nằm ở file này.

**Đang bắt đầu backend?** Đọc [`backend/README.md`](backend/README.md) trước.

## Luật chung cho cả hai bên

- **Không đổ file ra gốc.** Mã nguồn đi vào `frontend/`, `backend/` hoặc
  `shared/`. Gốc chỉ có: `README.md`, `CLAUDE.md`, `.gitignore`,
  `package.json`, `package-lock.json`, và năm thư mục trên.
- **Tài liệu nằm đúng nơi nó thuộc về.** Cả hai bên cùng cần → `.docs/`.
  Chỉ một bên cần → `frontend/docs/` hoặc `backend/docs/`.
- **Ranh giới FE ↔ BE:** màn hình không biết server tồn tại. Mọi lệnh gọi mạng
  nằm trong `frontend/src/features/<tên>/lib/*Api.ts`. Hiện `authApi.ts` là hàng
  giả (mã đúng: `123456`). Nối backend = thay ruột file đó, không đụng màn hình.
- **Đường dẫn API, mã lỗi, giới hạn: lấy từ `@nook/shared`, đừng gõ lại.** Gõ
  lại là mở đường cho hai bên lệch nhau mà không ai báo. Gói đó phải luôn
  `dependencies: {}` — nó bị nhét vào bản app trên điện thoại.
- **Không tệp nào nằm lung tung.** Mỗi loại một thư mục, mỗi thư mục một
  `index.ts`. Gốc một module chỉ có đúng `*.module.ts`. Import: cùng thư mục thì
  thẳng tệp, qua thư mục khác thì đi qua `index.js`.
- **`shared/` xếp theo MIỀN, không theo loại tệp** (`auth/` `user/` `circle/`…),
  để sau này tách được thành gói riêng. Trong mỗi miền, loại nằm ở tên tệp:
  `auth.constant.ts` · `auth.type.ts` · `auth.util.ts` · `auth.error.ts`.
- **Log của server viết TIẾNG ANH và chỉ ASCII.** `cmd` trên Windows mặc định
  chạy bảng mã cũ, chữ tiếng Việt ra thành rác. Chú thích trong mã, tài liệu,
  chữ trên Swagger thì vẫn tiếng Việt — chúng không đi qua console.
- **Mọi câu trả lời của server đều có cùng một cái vỏ:**
  `{ ok, code, data, requestId }` khi trót lọt, `{ ok, code, status, requestId }`
  khi hỏng. `code` LUÔN là khoá tra chữ, không bao giờ là câu tiếng Việt.

## Luật sản phẩm không được phá — cả hai bên

Đầy đủ ở [`.docs/01-product-system.md`](.docs/01-product-system.md), **đọc mục 0
và mục 3 trước tiên**. Ba luật hay bị quên nhất:

- **Cấp thân chỉ hai người trong cặp nhìn thấy.** Không API nào trả cấp thân của
  người khác cho người thứ ba.
- **Không bảng xếp hạng, không số like công khai.**
- Ba từ **cấm** trong chữ hiện cho người dùng: *điểm*, *hạng*, *nhiệm vụ*
  (tiếng Anh: *points*, *rank*, *quest*). Không chữ kỹ thuật ("OTP", "xác thực",
  "hợp lệ", "token", "session").
- **App nói hai thứ tiếng.** Chữ nằm ở `frontend/src/i18n/locales/`, không viết
  thẳng vào màn hình. Backend trả **mã lỗi**, không trả câu tiếng Việt —
  câu chữ là việc của app, xem `frontend/docs/09-i18n.md`.
- **Người dùng chọn được bảng màu** (5 bảng). Backend không cần biết — màu là
  việc của app, xem `frontend/docs/10-theme.md`.

## Trạng thái

| Phần | Trạng thái |
|---|---|
| Backend | **Đăng nhập chạy được đầu-tới-cuối.** `./setup/mac/run.sh be` rồi mở <http://localhost:4000/docs>. Tám đường đều chạy; mã 6 số ở Redis, thẻ phiên xoay mỗi lần làm mới. **Chỉ mở đường email** — số điện thoại trả `auth.method_unavailable` cho tới khi chọn được nhà mạng gửi SMS. Khi dev thì mã **in ra log server** (`CODE_SENDER=console`). Postgres dùng bản **trên máy** ở cổng 5432, Redis ở Docker cổng 6380 |
| Frontend | **Chạy được.** `cd frontend && npm run dev` rồi quét QR bằng Expo Go. Nói **hai thứ tiếng** (Việt + Anh) và có **năm bảng màu** người dùng chọn được, cả hai đổi trong Cài đặt. Ghim **SDK 54** vì Expo Go trên App Store kẹt ở đó — đừng nâng, xem `frontend/docs/06-libraries.md` mục 7 |
| Tài liệu | 15 file, đã chia theo hai bên |

Việc tiếp theo của BE: **góc bạn bè** (mời, chấp nhận, luật chặn người thứ 11)
— và đó cũng là thứ đầu tiên làm con đếm nhúc nhích, nên `AchievementService
.evaluate()` sẽ có người gọi từ đó.

Việc có thể làm ngay, ngắn: **nối `frontend/src/features/auth/lib/authApi.ts`
vào server thật.** Backend đã sẵn sàng; chỉ thay ruột hai hàm trong file đó,
không đụng màn hình nào.

Việc tiếp theo của FE: màn **Tên + ảnh** để đi hết một lượt onboarding, rồi
**Thêm bạn** — ô `+` ở hàng người hiện chỉ mở màn Góc, chưa mời được ai thật.
Việc cần quyết sớm: **có chuyển sang development build không** — widget cần nó,
và chuyển giữa chừng là đổi cả cách chạy dự án.
