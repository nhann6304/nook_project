---
name: nook-backend
description: Luật viết backend Nook (NestJS trên Fastify · Postgres · Redis · TypeORM · BullMQ). Dùng skill này MỖI KHI đụng bất kỳ tệp nào trong backend/ — thêm một đường API, thêm bảng, viết migration, sửa service, hay chạy thử trên máy. Nó nói chỗ đặt tệp, cái gì đã có sẵn khỏi viết lại, cái gì bị cấm, và những cái bẫy đã cắn người.
---

# Viết backend Nook

Đọc file này TRƯỚC khi gõ dòng đầu tiên. Năm câu:

1. **Import chỉ đi một chiều.** `core/` không biết nghiệp vụ; `repository/`
   không thuộc khán giả nào; trong `apis/app/` thì tầng dưới không biết tầng trên.
2. **Một thư mục là một BẢNG**, không phải một cửa. Bên trong thì phẳng.
3. **Không viết kho, không viết CRUD.** Bốn lớp gốc đã làm sẵn.
4. **Không quan hệ ORM.** Tham chiếu là cột `uuid`, cần thì hỏi kho bằng id.
5. **Không gõ chuỗi/số trần.** Đường dẫn, mã lỗi, giới hạn nằm ở `@nook/shared`.

`npm run check` soi được câu 1 và một phần câu 5. Ba câu còn lại thì không ai
soi — đó là lý do file này tồn tại.

---

## 0 · Cần sâu hơn thì đọc ĐÚNG một mục

`backend/README.md` dài **1000 dòng**. Đừng nạp cả file. Tra bảng này rồi đọc
đúng mục cần:

| Muốn biết | Mục |
|---|---|
| Đăng nhập không mật khẩu · thẻ · phiên · hai cửa signin/signup | 1 |
| Đặt tệp ở đâu · luật tầng · vì sao chia theo khán giả | 2 |
| **Bốn lớp gốc · giao dịch · mapper · vì sao không quan hệ ORM** | **3 — đọc trước khi viết module thứ ba** |
| Ảnh: xin đường ký, bản nhẹ, ai được xem, chọn kho | 4 |
| Tên riêng, và vì sao lớp đệm hoá ra không cần | 5 |
| Cột nào kiểu gì · migration viết tay | 6 |
| Redis đang làm năm việc gì | 7 |
| Socket là đường tắt, không phải lời hứa giao hàng | 8 |
| **Sáu chỗ đã vấp — đừng vấp lại** | 9 |
| Cổng thẻ, `@Public`, ai vào được gì | 10 |
| Ranh giới với frontend | 11 |

Luật chung cho cả hai bên nằm ở `CLAUDE.md` gốc (131 dòng, đọc cả cũng được).
Luật sản phẩm ở `.docs/01-product-system.md` — **mục 0 và mục 3 trước tiên**.

---

## 1 · Đặt tệp ở đâu

```
src/
├── core/          KHUNG — không biết một chữ nào về nghiệp vụ Nook
├── database/      entity/ · migration/ · data-source
├── repository/    KHO THEO BẢNG — dùng chung mọi khán giả
├── apis/
│   ├── auth/      đăng nhập — CẢ HAI khán giả đi qua đây
│   ├── app/       app React Native  → /v1/...
│   ├── admin/     web quản trị      → /v1/admin/...  (đều @Roles)
│   └── health/
├── config/ infra/ realtime/ queue/
```

| Thêm cái gì | Vào đâu |
|---|---|
| Một đường cho app | `apis/app/<tính-năng>/` |
| Một đường cho web quản trị | `apis/admin/<tính-năng>/` |
| Một bảng mới | `database/entity/<miền>/` + migration viết tay |
| Câu truy vấn riêng của một bảng | `repository/<miền>/` |
| Thứ mọi module đều cần, không dính nghiệp vụ | `core/` |
| Nói chuyện với thế giới ngoài (Redis, SMTP, S3) | `infra/` |
| Hằng số cả app lẫn server cần | `@nook/shared` |
| Hằng số **chỉ server** cần (mã lỗi Postgres, đuôi tệp) | hằng phía backend — **đừng** nhét vào `shared`, gói đó bị đóng vào bản app trên điện thoại |

**Trong một thư mục thì phẳng.** Tệp tách theo việc, thư mục thì không:
`user/` ôm cả `user.service.ts` lẫn `username.service.ts`. Chỉ mở thư mục con
khi một loại có **từ 3 tệp thật** trở lên — hiện chỉ `auth/` đạt.

---

## 2 · Trước khi mở một thư mục mới

Ba câu, **ít nhất hai câu "có" mới tách**:

- Nó có **bảng riêng** không?
- Nó **sống tiếp** được khi cái kia bị xoá không?
- App có **màn hình riêng** cho nó không?

`username` trả lời "không" cả ba (hai cột của `users`) → nằm trong `user/`.
`media` trả lời "có" cả ba → là thư mục riêng.

**Tầng trong `apis/app/`, import chỉ đi XUỐNG:**

| tầng | ai |
|---|---|
| 0 | `media` |
| 1 | `user` · `setting` |
| 2 | `circle` · `moment` · `thread` · `memory` |
| 3 | `achievement` · `notification` |

**Cùng tầng thì cấm gọi nhau.** Gặp là một trong hai đang sai chỗ; ba lối thoát
theo thứ tự nên thử: **gộp lại** · **hạ câu truy vấn xuống `repository/`** ·
**tầng dưới phát sự kiện, tầng trên nghe**. Tính năng mới phải khai tầng trong
`backend/scripts/check-arch.mjs`, không khai là `npm run check` đỏ.

Chọn giữa sự kiện và gọi thẳng: **sự kiện** cho việc *có thể trễ và thử lại
được* (đếm thành tích) · **gọi thẳng xuống** cho việc *phải xong hết hoặc không
xong* (xoá tài khoản). Dùng nhầm chiều là có việc làm được một nửa.

---

## 3 · Cần gì → dùng cái gì

| Cần | Dùng | Đừng dùng |
|---|---|---|
| Kho dữ liệu | `repos.for(Entity)`, hoặc lớp kế thừa `BaseRepository` khi có truy vấn riêng | `@InjectRepository` / `Repository<T>` — **neo vào kết nối gốc, chạy NGOÀI giao dịch, không báo gì cả** |
| Sáu cửa CRUD | `extends BaseCrudService` | viết lại từ đầu |
| Đổi hành vi một cửa | `override` đúng phương thức rồi gọi `super` | chép cả lớp ra sửa |
| Giao dịch | `@Transactional()` | chuyền tay `manager` qua từng tầng |
| Entity → thứ trả ra ngoài | `BaseMapper` | trả entity trần |
| Lỗi | `throw new AppException(ERR.X, HttpStatus.Y)` | `HttpException` trần, câu tiếng Việt |
| Mã HTTP | `HttpStatus` của `@nestjs/common` | số trần, thư viện status khác |
| Đường dẫn API | `API` bên `@nook/shared` | gõ lại chuỗi |
| Mã lỗi · giới hạn | `ERR`, `LIMITS` bên `@nook/shared` | tự chế |
| Người đang gọi | `@CurrentUser(): IAuthUser` | móc `req` thủ công |
| Mở cửa cho người chưa đăng nhập | `@Public()` **và** khai vào `scripts/check-public-routes.mjs` | chỉ `@Public()` — `npm run check` đỏ |
| Chặn theo vai | `@Roles(ROLE.admin, ROLE.root)` | tự đọc vai trong service |
| Trỏ sang bảng khác | cột `uuid` + hỏi kho bằng id | `@ManyToOne` `@OneToMany` `@OneToOne` `@JoinColumn` — **CẤM** |
| Đổi bảng | migration **viết tay** | `migration:generate` — **CẤM** |
| Việc nền | BullMQ, tên trong `QUEUE.*` | `setInterval` trong tiến trình — hai bản server là hai cái cùng chạy |
| Trả danh sách | `{ items, nextCursor }` | tự dàn phẳng, `ResponseInterceptor` làm hộ |
| Log | **tiếng Anh, chỉ ASCII** | tiếng Việt — `cmd` trên Windows ra chữ rác |

Chú thích trong mã, tài liệu, chữ trên Swagger thì **vẫn tiếng Việt** — chúng
không đi qua console.

**Chú thích NGẮN.** Ghi cái mà đọc mã không suy ra được: một quyết định, một cái
bẫy đã cắn người. Đừng thuật lại việc mã đang làm. Dài hơn vài dòng thì nó thuộc
về `backend/README.md`.

---

## 4 · Vỏ câu trả lời — hai nhánh, cùng một bộ trường

```
{ ok, code, status, data, metadata }
```

- `ok` là chỗ rẽ nhánh **duy nhất**.
- `code` **luôn** là khoá tra chữ (`auth.code_sent`), không bao giờ là câu tiếng Việt.
- `status` là mã HTTP dạng **số**, có ở cả hai nhánh.
- Hỏng thì `data` là `null` — **không phải thiếu trường**.
- `metadata` gom thứ nói VỀ câu trả lời: `requestId`, `serverTime`, và với danh
  sách thì thêm `nextCursor` / `hasMore` / `count`.
- **Danh sách được dàn phẳng:** `data` chính là mảng, app không phải với qua
  `data.items`.

Câu chữ hiện cho người dùng là việc của app. Backend trả **mã**.

---

## 5 · Chạy và kiểm

```bash
./setup/mac/run.sh be        # mac — server + ghi log ra backend/.logs/server.log
setup\win\run.bat be         # windows
npm run check                # arch · public · typecheck · lint · test (push cũng chạy)
npm run migration:run        # bảng KHÔNG tự dựng, phải chạy tay
```

Cần: **Postgres trên máy cổng 5432** · **Redis Docker cổng 6380** · MinIO cổng
9000 (chỉ cho đường ảnh).

Bốn bài smoke gõ vào server đang chạy, mỗi bài kết bằng một dòng ĐẠT/HỎNG:

```bash
backend/scripts/smoke-auth.sh          27 bước — xin mã, xoay thẻ, thẻ bị chép, hai cửa
backend/scripts/smoke-username.sh      15 bước — có cả cuộc đua hai người cùng chọn
backend/scripts/smoke-media.sh         20 bước — bằng ảnh THẬT, so sha256
backend/scripts/smoke-admin.sh          9 bước — cổng vai
node backend/scripts/check-guard.mjs   16 cửa — gõ thật, không cầm thẻ
```

Cả bốn đọc mã 6 số từ log server. Log ở chỗ khác thì `NOOK_LOG=<đường dẫn>`,
server ở cổng khác thì `BASE=http://localhost:<cổng>`.

---

## 6 · Bảy cái bẫy đã cắn người

1. **Bảng không tự dựng.** Chưa chạy migration thì `POST /v1/auth/code` vẫn trả
   `200` (nó chỉ ghi Redis) trong khi **mọi đường chạm bảng đều 500** — trông
   như server sống. Dò bằng `intent: 'signin'`, đường đó có hỏi bảng.
2. **`.env` chỉ nạp lúc bật server.** `nest start --watch` không nạp lại. Sửa
   `.env` xong phải tắt bật.
3. **Mã 6 số bị BĂM trong Redis** — không đọc ngược được. Muốn lấy mã thì đọc
   log server (`CODE_SENDER=console`), không có đường nào khác.
4. **Hai bản server dùng chung Redis thì giành việc của nhau.** Bật bản thứ hai
   để thử thì việc nền có thể bị bản kia nẫng, và log nằm ở tiến trình kia.
5. **Windows không có `psql` và `python3`.** Bài smoke hỏi bảng qua
   `scripts/db.sh` (dùng `pg` của Node, tài khoản đọc từ `.env`) — **đừng gọi
   `psql` trong script mới**. Chuỗi có dấu cũng không được truyền qua dòng lệnh
   cho `curl`: bảng mã console biến nó thành `?`, phải tự mã hoá `%XX`.
6. **Bộ soi từng chết câm trên Windows.** `new URL().pathname` ra `/D:/...`;
   `check-arch` nuốt lỗi rồi in "ok" mà chưa đọc một tệp nào. Script mới dùng
   `fileURLToPath`, và **đừng nuốt lỗi đường dẫn**.
7. **Thẻ dài hạn xoay mỗi lần làm mới.** Bắn nhiều lệnh làm mới song song là mất
   phiên. Có khoảng ân hạn 30 giây, nhưng đó là lưới an toàn cho mạng chập chờn,
   không phải giấy phép bắn song song.

---

## 7 · Ba luật sản phẩm không được phá

- **Cấp thân chỉ hai người trong cặp nhìn thấy.** Không API nào trả cấp thân của
  người khác cho người thứ ba — **kể cả đường quản trị**.
- **Không bảng xếp hạng, không số like công khai.**
- Backend trả **mã lỗi**, không trả câu tiếng Việt. Ba từ cấm trong chữ hiện cho
  người dùng: *điểm*, *hạng*, *nhiệm vụ*.
