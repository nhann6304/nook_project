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
- **Backend chia ba tầng:** `core/` là khung (không biết nghiệp vụ) ·
  `repository/` là kho theo bảng (không thuộc khán giả nào) · `api/` là tính
  năng, chia theo KHÁN GIẢ: `api/app/` cho React Native, `api/admin/` cho web
  quản trị, `api/auth/` dùng chung. Có `npm run check:arch` soi chiều phụ thuộc.
- **Một thư mục là MỘT VIỆC; bên trong thư mục đó thì phẳng.**
  `user/` và `username/` là hai việc nên là hai thư mục, mỗi cái ôm đủ đồ của
  nó: `x.module.ts`, `x.controller.ts`, `x.service.ts`, `x.dto.ts`,
  `x.mapper.ts`, `index.ts`. **Chỉ tách thư mục con khi một loại có từ 3 tệp
  thật trở lên** (hiện chỉ `auth/` đạt: `service/` và `dto/`).
  Hai lỗi ngược nhau, tránh cả hai: gộp sớm thì tìm code phải đi qua mấy tầng
  rỗng — `apis/` từng có 39 `index.ts` trên tổng 84 tệp; phẳng quá thì hai việc
  khác nhau nằm lẫn trong một thư mục.
  Import: cùng thư mục thì thẳng tệp, qua thư mục khác thì đi qua `index.js`.
- **`shared/` xếp theo MIỀN ở ngoài, LOẠI ở trong.** `auth/`, `user/`, `circle/`…
  để sau này tách được thành gói riêng; trong mỗi miền có `constant/`,
  `interface/`, `type/`, `util/`, mỗi thư mục một `index.ts`.
- **Quy ước đặt tên, bắt buộc, cả hai bên:** `interface` → thư mục `interface/`,
  tệp `*.interface.ts`, tên bắt đầu bằng **`I`**. `type` → thư mục `type/`, tệp
  `*.type.ts`, tên bắt đầu bằng **`T`**. DTO → thư mục `dto/`, tệp `*.dto.ts`,
  tên kết thúc bằng `Dto`. `interface` tả một hình dạng; `type` ghép hoặc suy ra
  từ hình dạng có sẵn.
- **Không dùng quan hệ ORM.** Cấu trúc nhiều-về-một vẫn giữ (cột khoá ngoại +
  ràng buộc trong cơ sở dữ liệu), nhưng KHÔNG có `@ManyToOne` / `@OneToMany` /
  `@OneToOne` / `@JoinColumn`. Tham chiếu là cột `uuid`, cần bên kia thì hỏi kho
  bằng id. Lý do ở `backend/README.md` mục 3.
- **Chú thích NGẮN.** Ghi cái mà đọc mã không suy ra được: một quyết định, một
  cái bẫy đã cắn người. Đừng thuật lại việc mã đang làm, đừng viết bài giảng.
  Vài dòng là đủ; dài hơn thì nó thuộc về `.docs/` hoặc `backend/README.md`.
- **Đừng gõ chuỗi/số trần trong logic.** Hai bên cùng cần → `@nook/shared`.
  Chỉ server cần (mã lỗi Postgres, đuôi tệp) → hằng số phía backend, **không**
  nhét vào `shared` vì gói đó bị đóng vào bản app trên điện thoại. Mã HTTP dùng
  `HttpStatus` của `@nestjs/common`.
- **Log của server viết TIẾNG ANH và chỉ ASCII.** `cmd` trên Windows mặc định
  chạy bảng mã cũ, chữ tiếng Việt ra thành rác. Chú thích trong mã, tài liệu,
  chữ trên Swagger thì vẫn tiếng Việt — chúng không đi qua console.
- **Mọi câu trả lời của server đều có cùng một cái vỏ, và HAI NHÁNH CÙNG MỘT BỘ
  TRƯỜNG:** `{ ok, code, status, data, metadata }`. Hỏng thì `data` là `null`
  (không phải thiếu trường) và có thêm `detail` khi mã lỗi cần kèm số.
  `ok` là chỗ rẽ nhánh duy nhất; `code` LUÔN là khoá tra chữ, không bao giờ là
  câu tiếng Việt; `status` là mã HTTP dạng SỐ, có ở cả hai nhánh.
  `metadata` gom thứ nói VỀ câu trả lời — `requestId`, `serverTime`, và khi trả
  danh sách thì thêm `nextCursor` / `hasMore` / `count`. **Danh sách được dàn
  phẳng:** `data` chính là mảng, app không phải với qua `data.items`. Cửa cứ trả
  `{items, nextCursor}` như thường, `ResponseInterceptor` dàn hộ.
  Mã HTTP viết bằng `HttpStatus` của `@nestjs/common`, đừng gõ số trần và đừng
  cài thư viện mã trạng thái nào khác.

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
| Backend | **Đăng nhập chạy được đầu-tới-cuối.** `./setup/mac/run.sh be` rồi mở <http://localhost:4000/docs>. Tám đường đều chạy; mã 6 số ở Redis, thẻ phiên xoay mỗi lần làm mới và **hạn tự đẩy ra xa** — 180 ngày tính từ lần mở app gần nhất, nên người dùng đăng nhập đúng một lần rồi thôi. Màn đăng nhập có **hai cửa**: gửi kèm `intent: 'signin' \| 'signup'` vào `/v1/auth/code` thì server soi trước và trả `auth.account_not_found` / `auth.account_exists` mà KHÔNG gửi thư, để app đổi màn ngay. Đi kèm nó là trần xin mã **theo máy gọi** (30/giờ) — không có trần đó thì cửa này thành máy dò "ai đang dùng Nook", nên đừng gỡ. **Chỉ mở đường email** — số điện thoại trả `auth.method_unavailable` cho tới khi chọn được nhà mạng gửi SMS. Khi dev thì mã **in ra log server** (`CODE_SENDER=console`). Postgres dùng bản **trên máy** ở cổng 5432, Redis ở Docker cổng 6380 |
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
