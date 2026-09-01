# Nook — backend

NestJS trên Fastify · PostgreSQL · Redis · TypeORM · Socket.IO · BullMQ.
**Đăng nhập bằng email đã chạy được đầu-tới-cuối.**

```bash
./setup/mac/run.sh be     # từ gốc kho — tự cài, tự dựng .env, tự migrate
```

Cần: **Postgres trên máy** (Homebrew, cổng 5432) và **Docker** cho Redis.

- API — <http://localhost:4000>
- Swagger — <http://localhost:4000/docs>
- Dò sống chết — <http://localhost:4000/health> (chạm thật vào Postgres và Redis)

---

## 1. Đã có gì, chưa có gì

Tám đường, **tất cả đã chạy được**:

| | Đường | |
|---|---|---|
| `POST` | `/v1/auth/code` | xin mã 6 số |
| `POST` | `/v1/auth/verify` | nộp mã, nhận thẻ, chưa có tài khoản thì mở luôn |
| `POST` | `/v1/auth/refresh` | xoay thẻ |
| `POST` | `/v1/auth/logout` | thu thẻ |
| `GET` | `/v1/me` | hồ sơ của mình |
| `PATCH` | `/v1/me` | đặt tên |
| `GET` | `/v1/me/achievements` | thành tích + sức chứa của góc |
| `GET` | `/health` | dò sống chết |

### Chỉ mở đường EMAIL

Số điện thoại còn chờ chọn nhà mạng gửi SMS. Xin mã qua số điện thoại thì bị
từ chối bằng `auth.method_unavailable` — **không phải** một lỗi chung chung, để
app nói được cho đúng.

Ngày mở SMS: thêm `'phone'` vào `SIGNIN_METHODS_ENABLED` bên `@nook/shared`, rồi
viết một `SmsSender`. App đọc chính danh sách đó để biết vẽ mấy cái nút, nên
không phải sửa màn hình.

### Mã đăng nhập đi đâu khi dev

`CODE_SENDER=console` — mã **in ra log server**, không gửi đi đâu cả:

```
WARN [Mã đăng nhập] [CHỈ DÙNG KHI DEV] email → nam@gmail.com — mã: 193167
```

Muốn gửi email thật thì đổi `CODE_SENDER=smtp` và điền `SMTP_URL`.
`validateEnv` chặn không cho `console` đi cùng bản thật.

### Chưa có

`AchievementService.evaluate()` đã viết đủ nhưng **chưa ai gọi** — nó chỉ chạy
từ chặng 3, khi có góc bạn bè và ký ức thật làm con đếm nhúc nhích. Nên bây giờ
`/v1/me/achievements` có thể hiện `value` đã vượt `threshold` mà `unlockedAt`
vẫn `null`. Đúng, không phải lỗi.

## 2. Cây thư mục

**Luật: không tệp nào nằm lung tung.** Mỗi loại một thư mục, mỗi thư mục một
`index.ts`. Ở gốc một module chỉ có đúng tệp `*.module.ts` — cái đặt tên cho
thư mục.

```
backend/
├── docker/compose.dev.yml     Redis (+ Postgres và MinIO trong profile riêng)
├── Dockerfile                 bản thật, nhiều chặng
└── src/
    ├── main.ts · app.module.ts
    │
    ├── config/                env/ · swagger/
    ├── database/
    │   ├── entity/            base/ · user/ · session/ · achievement/
    │   ├── migration/         SQL viết TAY (không có index — nạp bằng glob)
    │   ├── repository/        BaseRepository — tự bám giao dịch
    │   ├── transaction/       TransactionContext · TransactionService · @Transactional
    │   └── data-source/       cho bộ lệnh TypeORM
    │
    ├── api/
    │   ├── common/            thứ mọi cửa đều dùng
    │   │   ├── auth/          auth.module.ts + controller/ service/ repository/
    │   │   │                  dto/ guard/ strategy/ type/
    │   │   ├── health/        health.module.ts + controller/ dto/
    │   │   ├── decorator/     @Public @CurrentUser @Message @ApiResult @ApiErrors
    │   │   ├── dto/           vỏ câu trả lời · lỗi · lật trang · hồ sơ
    │   │   ├── error/         AppException
    │   │   ├── filter/        gom mọi thứ hỏng về một hình dạng
    │   │   ├── interceptor/   bọc vỏ · đo chậm
    │   │   ├── mapper/        BaseMapper
    │   │   └── pipe/          bộ kiểm đầu vào
    │   └── model/             một thư mục cho một thứ có thật trong sản phẩm
    │       ├── user/          user.module.ts + controller/ service/ repository/ mapper/ dto/
    │       └── achievement/   achievement.module.ts + (như trên)
    │
    ├── infra/                 redis/service/ · notify/{sender,service}/
    ├── realtime/              gateway/ · adapter/
    └── queue/                 constant/
```

**Luật import, một câu:** *cùng thư mục thì import thẳng tệp; qua thư mục khác
thì đi qua `index.js` của thư mục đó.* Nhờ vậy tệp module đọc được như một bản
mục lục:

```ts
import { AuthController } from './controller/index.js';
import { AuthService, CodeService, CookieService, SessionService } from './service/index.js';
import { SessionRepository } from './repository/index.js';
```

Chặng sau thêm vào `api/model/`: `circle` · `moment` · `thread` · `media` ·
`memory` · `push`. Mỗi cái một thư mục đủ bộ, dựng theo đúng khuôn trên.

## 3. Bốn khuôn mẫu — đọc trước khi viết cửa thứ chín

Mục này là phần đáng đọc nhất của file. Bốn thứ dưới đây khiến **cửa mới không
phải viết lại thứ cửa cũ đã viết**.

### Kho dữ liệu (`BaseRepository`)

Dịch vụ **không** chạm vào `Repository<T>` của TypeORM, và **không** dùng
`@InjectRepository`. Nó gọi kho, kho tự chọn `Repository` theo giao dịch đang
chạy.

```ts
@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectDataSource() ds: DataSource) { super(ds, User); }
  findAlive(id: string) { return this.findOne({ id, deletedAt: IsNull() }); }
}
```

Vì sao không `@InjectRepository`: nó trả về một `Repository` **neo cứng vào kết
nối gốc**. Gọi nó trong `tx.run()` thì câu lệnh chạy NGOÀI giao dịch — ghi được,
không báo lỗi, và ở lại kể cả khi giao dịch bị huỷ.

Câu SQL thô thì đi qua `this.manager.query(...)` — cũng bám giao dịch.

### Giao dịch (`TransactionService` · `@Transactional()`)

```ts
@Transactional()
async attachOrCreate(...) {
  const user = await this.users.create({});
  await this.stats.create({ userId: user.id });
  // ba câu vào hết, hoặc không câu nào vào
}
```

`AsyncLocalStorage` giữ `EntityManager` theo nhánh gọi, nên **không phải chuyền
tay `manager` qua từng tầng**. Quên chuyền ở một chỗ là câu đó rơi ra ngoài
giao dịch — loại bug nhìn bằng mắt không ra.

**Lồng nhau thì NHẬP vào, không mở giao dịch mới.** Cần tách rời thật thì gọi
`runIsolated()`, và phải cố ý.

### Bộ nắn (`BaseMapper`)

Chỗ **duy nhất** quyết định người ngoài được thấy cột nào. Để việc này nằm rải
trong dịch vụ thì sớm muộn có một cửa trả nguyên entity ra ngoài. Với Nook thì
còn nặng hơn: luật sản phẩm cấm trả cấp thân của người khác cho người thứ ba, và
chỗ chặn được là đây.

### Vỏ câu trả lời

Tay viết controller chỉ trả về **dữ liệu**. `ResponseInterceptor` bọc, tự động:

```jsonc
{ "ok": true,  "code": "auth.code_sent", "data": { }, "requestId": "req-9f2c" }
{ "ok": false, "code": "auth.code_expired", "status": 410, "requestId": "req-9f2c" }
```

`ok` là chỗ rẽ nhánh duy nhất. `code` LUÔN là khoá tra chữ, **không bao giờ** là
câu tiếng Việt — app tra bảng chữ của nó, server không biết máy người dùng đang
để tiếng gì.

Khai ở controller bằng ba decorator, không tả tay:

```ts
@Message(MSG.CODE_SENT)        // đổi `code`; không dán thì mặc định 'ok'
@ApiResult(SendCodeResultDto)  // Swagger: vỏ + hình dạng của `data`
@ApiErrors(400, 429, 502)      // các mã hỏng
```

## 4. Bảng

Bảy bảng. Ba nhóm.

**Người và phiên** — `users` · `user_identities` · `sessions`

- `users` **không có cột `level`**, và sẽ không bao giờ có. Cấp thân là chuyện
  của một CẶP, không phải thuộc tính của một người.
- Email và số điện thoại nằm ở `user_identities`, không nằm ở `users`: một người
  có thể có cả hai, và sau này còn đổi được. `UNIQUE(kind, value)` là thứ duy
  nhất chặn được cuộc đua "hai máy cùng nộp mã cho một email".
- `sessions.id` chính là `sid` trong thẻ → thu hồi được **từng máy một**. Trong
  bảng chỉ có **dấu vân** argon2 của thẻ dài hạn, không có thẻ.
- `tz_offset_minutes` trên `users` không phải cho vui: trần "3 ký ức một ngày"
  và chuỗi ngày liền nhau tính theo ngày mà **người dùng** đang sống, không phải
  ngày của máy chủ.

**Thành tích** — `achievements` · `user_achievements` · `user_stats`

Một luật cho mọi thành tích: *con đếm chạm ngưỡng thì mở, và mở thì cộng thêm
mấy chỗ vào góc*. Nên **thêm thành tích mới = thêm một DÒNG**, không sửa mã.

Chín thành tích đầu tiên đã có sẵn trong migration, cộng lại mở thêm 15 chỗ —
10 chỗ ban đầu thành 25, vẫn dưới trần 35, còn dư đất cho sau này.

`user_stats` là bảng **suy ra được**, không phải nguồn sự thật. Nguồn sự thật là
bảng `events` chỉ-ghi-thêm (chặng sau). Mọi con số ở đây phải dựng lại được từ đó.

**Riêng tư:** không đường nào trả thành tích hay con đếm của người khác. Không
bảng xếp hạng, và cũng đừng dựng bảng tổng để rồi lộ ra ở một cửa nào đó.

### Migration viết TAY. Đừng chạy `migration:generate`

Bộ sinh tự động **không thấy** index một phần (`WHERE …`) và ràng buộc `CHECK`.
Nó sẽ lặng lẽ đẻ ra một file xoá sạch chúng, và không ai nhận ra cho tới lúc dữ
liệu đã lệch. Lược đồ này có 2 index một phần và 6 ràng buộc `CHECK`.

```bash
npm run migration:run      # dựng rồi chạy — thứ được migrate đúng bằng thứ sẽ chạy
npm run migration:revert
npm run migration:show
```

## 5. Redis làm năm việc

1. Mã đăng nhập 6 số, tự chết sau 5 phút
2. Con đếm chống gọi quá dày
3. Hàng đợi việc nền (BullMQ)
4. Cầu nối cho socket khi chạy nhiều bản server
5. **Vị trí** — và cái này phải nói rõ: vị trí **không bao giờ** chạm vào
   Postgres. `EXPIRE 900` là 15 phút sau nó biến mất thật. Ghi vào Postgres thì
   nó còn nằm trong WAL và trong mọi bản sao lưu; "đã xoá" ở đó không có nghĩa
   là đã mất.

Việc gì cần **nhớ lâu** thì đi Postgres. Redis là chỗ của thứ được phép quên.

## 6. Socket là đường tắt, không phải lời hứa giao hàng

App bị đẩy ra nền là ống đứt, và nó đứt thường xuyên hơn nhiều so với cảm giác
lúc ngồi thử máy. Thứ bảo đảm tới nơi vẫn là **ghi vào cơ sở dữ liệu, rồi bắn
thông báo đẩy**. Socket chỉ làm người đang mở app thấy nhanh hơn vài giây.

Hệ quả: nối lại thì **hỏi lại bằng REST**, đừng phát lại qua ống. Ống không nhớ
nó đã bỏ lỡ những gì.

## 7. Sáu chỗ đã vấp — đừng vấp lại

**NestJS 12 bỏ hẳn CommonJS.** `@nestjs/common`, `@nestjs/core`,
`@nestjs/typeorm` đều là `"type": "module"`. Nên backend là ESM, và **mọi import
tương đối phải có đuôi `.js`** (kể cả khi file nguồn là `.ts`). Thư mục thì
`./abc/index.js`. Không có `__dirname` — dùng `import.meta.dirname`.

**Plugin Swagger đụng vào entity thì sinh vòng tròn nhập khẩu.** Mặc định nó coi
`*.entity.ts` là DTO và chèn thêm `import` runtime, làm ESM ném
`Cannot access 'User' before initialization` ngay lúc nạp. Đã chặn bằng
`dtoFileNameSuffix: [".dto.ts"]` trong `nest-cli.json`. **Đừng gỡ dòng đó.**
Nói cho đúng thì nó cũng đúng về nguyên tắc: entity không bao giờ được là mẫu
Swagger, vì như vậy là để lộ cột ra ngoài.

**Bảng `users` là trục của bốn quan hệ.** Phía trục dùng `import type` + tên
bảng dạng chuỗi + `Relation<>`; bốn bảng con nhập `User` bình thường. Một chiều
thì không thành vòng. Xem ghi chú trong `user.entity.ts`.

**Tệp data-source chỉ được xuất ra ĐÚNG MỘT thứ.** Thấy hai thứ là bộ lệnh
TypeORM không đoán, nó từ chối. Và vì nó nằm ở `database/data-source/`, đường
dò migration phải là `${import.meta.dirname}/../migration/*` — thiếu `..` thì
`migration:show` im lặng trả về rỗng, trông y như chưa có migration nào.

**Gộp bảng hằng số thì trùng khoá là đè im lặng.** `ERR` bên `@nook/shared` gộp
từ bốn miền; `USER_ERR.NOT_FOUND` từng đè `COMMON_ERR.NOT_FOUND` mà không ai
báo. Nay khoá của từng miền mang tiền tố (`USER_NOT_FOUND`, `CIRCLE_FULL`) và
có chốt biên dịch bắt trùng — xem `shared/src/catalog/error.catalog.ts`.

**Ném trong giao dịch thì cuộn luôn thứ vừa ghi.** Chỗ `rotate()` phát hiện thẻ
dài hạn bị chép: nó thu hồi hết phiên rồi ném. Viết thẳng thì việc thu hồi bị
cuộn lại theo cú ném, và kẻ cầm thẻ chép vẫn đi lại thoải mái — server trả 401
nhưng trong bảng chẳng có gì đổi. Phải ghi bằng `tx.runIsolated()`. Đây là chỗ
DUY NHẤT trong dự án cần giao dịch tách rời; gặp chỗ thứ hai thì dừng lại nghĩ
kỹ trước.

**Postgres chạy thẳng trên máy, không qua Docker.** `DB_PORT=5432`, kho `nook`,
vai `nook`. Đỡ một tầng: `psql` gõ thẳng được, dữ liệu không bay khi ai đó lỡ
`down -v`. Máy khác không có Postgres thì
`docker compose -f backend/docker/compose.dev.yml --profile db up -d` rồi đổi
`DB_PORT=5433`. **Redis vẫn ở Docker, cổng 6380** — 6379 đã có Redis của dự án khác.

**Node 22 hoặc 24, đừng dùng 23.** Vài thư viện khai `engines` là
`^20.19 || ^22.13 || >=24`; bản lẻ nằm ngoài lời hứa đó.

## 8. Ranh giới với frontend

**Màn hình không biết server tồn tại.** Mọi lệnh gọi mạng của app nằm gọn trong
`frontend/src/features/<tên>/lib/*Api.ts`. Hiện có đúng một file như vậy:
`authApi.ts`, và nó vẫn là **hàng giả** (mã đúng: `123456`).

Nối backend = **thay ruột file đó**, không sửa một màn hình nào. Nếu thấy mình
đang phải sửa file trong `frontend/src/features/*/screens/` để nối server —
dừng lại, ranh giới đang bị cắt qua.

Đường dẫn, mã lỗi, giới hạn thì lấy từ `@nook/shared`, đừng gõ lại chuỗi.
