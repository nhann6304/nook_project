# Nook — backend

NestJS trên Fastify · PostgreSQL · Redis · TypeORM · Socket.IO · BullMQ.
**Đăng nhập bằng email đã chạy được đầu-tới-cuối.**

```bash
./setup/mac/run.sh be            # cửa sổ 1 — server
./backend/scripts/smoke-auth.sh  # cửa sổ 2 — chạy thử toàn bộ luồng đăng nhập
```

Cần: **Postgres trên máy** (Homebrew, cổng 5432) và **Docker** cho Redis.

`smoke-auth.sh` đi hết 15 bước — xin mã, chặn xin dồn, mã sai, mã đúng, mã dùng
một lần, xoay thẻ, thẻ bị chép, cổng thẻ — rồi kết bằng một dòng ĐẠT/HỎNG. Nó
đọc mã 6 số từ `backend/.logs/server.log`, tệp mà `run.sh` ghi ra.

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
    │   ├── entity/            base/ (thang uuid → audit → soft-delete) · user/ · session/ · achievement/
    │   ├── context/           RequestContext — ai đang thao tác
    │   ├── migration/         SQL viết TAY (không có index — nạp bằng glob)
    │   ├── repository/        BaseRepository · GenericRepository · RepositoryManager
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
    │   │   ├── middleware/    mở RequestContext, chạy trước cổng thẻ
    │   │   ├── service/       BaseCrudService (+ bài kiểm)
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

## 3. Tầng dùng chung — đọc trước khi viết module thứ ba

Mục này là phần đáng đọc nhất. Nó tồn tại để **module mới không phải viết lại
thứ module cũ đã viết**.

### Module mới, phiên bản ngắn nhất

```ts
@Injectable()
export class MomentService extends BaseCrudService<Moment, MomentDto> {
  constructor(repos: RepositoryManager, mapper: MomentMapper) {
    super(repos.for(Moment), mapper);   // xong. Đã có đủ create/read/update/delete/page
  }
}
```

**Không phải viết tệp kho nào.** `RepositoryManager.for(Entity)` phát ra một
kho đã biết bám giao dịch và tự đóng dấu sổ ghi việc. Có câu truy vấn riêng thì
mới viết lớp kế thừa `BaseRepository` — hai cách dùng chung một lớp gốc nên
hành vi giống hệt nhau.

Cần khác thì **đè đúng phương thức đó**, mấy cái còn lại giữ nguyên:

```ts
override async create(input: DeepPartial<Moment>) {
  await this.assertUnderDailyCap();      // luật riêng
  return super.create(input);            // phần chung vẫn dùng lại
}
protected override notFoundCode() { return ERR.MOMENT_NOT_FOUND; }
```

### Không dùng quan hệ ORM

**Cấu trúc vẫn là nhiều-về-một.** Cột khoá ngoại vẫn còn, ràng buộc vẫn nằm
trong cơ sở dữ liệu:

```
sessions.user_id          -> users.id           ON DELETE CASCADE
user_identities.user_id   -> users.id           ON DELETE CASCADE
user_stats.user_id        -> users.id           ON DELETE CASCADE
user_achievements.user_id -> users.id           ON DELETE CASCADE
user_achievements.achievement_key -> achievements.key  ON DELETE RESTRICT
```

Thứ **không** dùng là `@ManyToOne` / `@OneToMany` / `@OneToOne` / `@JoinColumn`.
Tham chiếu là một cột `uuid` bình thường, và ai cần bên kia thì tự đi hỏi:

```ts
const identity = await this.identities.findByTarget(kind, value);
const user = await this.users.findById(identity.userId, { withDeleted: true });
```

Hai câu hỏi thay vì một cú nối bảng — và cả hai đều nhìn thấy được.

Bốn thứ decorator quan hệ mang theo mà không nói ra:

- **nạp thừa hay thiếu** tuỳ chỗ gọi có nhớ khai `relations` hay không
- **sinh câu JOIN** mà không ai đọc được nó ra sao cho tới lúc bật log SQL
- **buộc hai tệp entity nhập khẩu lẫn nhau** — ở ESM thì vòng tròn đó làm server
  chết ngay lúc nạp, và đã làm thật một lần
- **đổi hành vi ngầm**: từ khi `User` xoá mềm, phần nối bảng tự lọc bỏ người đã
  xoá, và một nhánh kiểm đang đúng bỗng ngã 500 — cũng đã xảy ra thật

Ràng buộc trong cơ sở dữ liệu thì giữ, vì nó là chuyện khác hẳn: nó nằm trong
SQL viết tay, đọc là thấy, và nó còn hiệu lực cả khi có người gõ `psql` xoá tay.

### Thang bảng dữ liệu

| Kế thừa | Được gì | Dùng khi |
|---|---|---|
| `UuidEntity` | `id` uuid | bảng tra, bảng nối |
| `AuditEntity` | + `createdAt` `updatedAt` `createdBy` `updatedBy` | gần như mọi bảng có người thật đứng sau |
| `SoftDeleteEntity` | + `deletedAt` `deletedBy` | chỉ khi xoá thật là sai |

`createdBy` / `updatedBy` **tự điền**, không tầng nào chuyền tay id người gọi:

```
lớp giữa mở RequestContext  →  cổng thẻ gọi setActor(userId)  →  kho đọc ra lúc ghi
```

Bảng không có mấy cột đó thì kho bỏ qua, im lặng và đúng. Rỗng cũng là một câu
trả lời đúng: lúc mở tài khoản thì chưa có ai để ghi.

UUID chứ không phải số tự tăng — `/users/1` và `/users/2` nói ra app có bao
nhiêu người và họ vào lúc nào. Với một app về chuyện riêng tư giữa vài người
thì đó là chỗ rò không cần thiết.

### Bốn lớp gốc

**`BaseRepository`** — dịch vụ **không** chạm `Repository<T>` của TypeORM và
**không** dùng `@InjectRepository`. Lý do thật: `@InjectRepository` trả về thứ
**neo cứng vào kết nối gốc**; gọi trong `tx.run()` thì câu lệnh chạy NGOÀI giao
dịch — ghi được, không báo lỗi, và ở lại kể cả khi giao dịch bị huỷ. Kho ở đây
hỏi `TransactionContext` lúc dùng nên luôn ở đúng chỗ. Kèm `pageByCursor`.

**`TransactionService` · `@Transactional()`** — `AsyncLocalStorage` giữ
`EntityManager` theo nhánh gọi, nên không phải chuyền tay `manager` qua từng
tầng. Lồng nhau thì **nhập vào**, không mở giao dịch con. Cần tách rời thật thì
`runIsolated()` — và trong cả dự án chỉ có **đúng một chỗ** cần nó (xem mục 7).

**`BaseMapper`** — chỗ **duy nhất** quyết định người ngoài thấy cột nào. Để việc
này rải trong dịch vụ thì sớm muộn có cửa trả nguyên entity ra ngoài. Với Nook
còn nặng hơn: luật cấm trả cấp thân của người khác cho người thứ ba, và chỗ chặn
được là đây.

**`BaseCrudService`** — sáu cửa cơ bản. Cố ý **không** có `@Transactional()`
(mỗi phương thức chỉ chạy một câu lệnh, Postgres đã bọc sẵn) và **không** có
hook `beforeCreate`/`afterCreate` (hook làm luồng chạy biến mất khỏi chỗ đọc —
nhìn `create()` không còn biết thật ra có bao nhiêu thứ chạy). Có bài kiểm ở
`base-crud.service.spec.ts`.

### Vỏ câu trả lời

Tay viết controller chỉ trả về **dữ liệu**. `ResponseInterceptor` bọc, tự động:

```jsonc
{ "ok": true,  "code": "auth.code_sent",    "data": { }, "requestId": "req-9f2c" }
{ "ok": false, "code": "auth.code_expired", "status": 410, "requestId": "req-9f2c" }
```

`ok` là chỗ rẽ nhánh duy nhất. `code` LUÔN là khoá tra chữ, **không bao giờ** là
câu tiếng Việt. Khai ở controller bằng ba decorator, không tả tay:

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

**Vòng tròn nhập khẩu giữa các entity — nay không còn.** Trước đây `users` là
trục của bốn quan hệ và phải lách bằng `import type` + tên bảng dạng chuỗi +
`Relation<>`. Từ khi bỏ hẳn decorator quan hệ thì entity không nhập khẩu lẫn
nhau nữa, nên vòng tròn không dựng lên được. Đừng thêm `@ManyToOne` vào — nó
kéo ngay chuyện cũ trở lại.

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

**Thẻ ký hai lần trong cùng một giây ra hai thẻ GIỐNG HỆT NHAU.** Ruột thẻ chỉ
có `{sub, sid, typ, iat, exp}` mà `iat`/`exp` tính bằng giây — nên app vừa đăng
nhập xong đã gọi làm mới thẻ là ra đúng thẻ cũ, việc xoay thẻ không xảy ra, và
cái bẫy "thẻ bị chép" cũng im luôn. Nay mỗi thẻ mang một `jti` ngẫu nhiên. Bài
kiểm `scripts/smoke-auth.sh` gọi làm mới **không có `sleep`** để luôn đi qua
đúng ca này — đừng thêm `sleep` vào đó.

**Log viết bằng TIẾNG ANH và chỉ ASCII.** Không phải chuyện thẩm mỹ: `cmd` trên
Windows mặc định chạy bảng mã cũ, chữ tiếng Việt ra thành rác. Mấy tệp `.bat`
có `chcp 65001` rồi, nhưng log còn đi ra tệp, ra chỗ gom log, ra cửa sổ của
người khác. Chú thích trong mã và tài liệu thì vẫn tiếng Việt — chúng không đi
qua console.

**Quy ước đặt tên — bắt buộc.**

| | Thư mục | Tên tệp | Tiền tố |
|---|---|---|---|
| interface | `interface/` | `user.interface.ts` | **`I`** — `IAuthUser` |
| type | `type/` | `user.type.ts` | **`T`** — `TIdentityKind` |
| DTO | `dto/` | `send-code.dto.ts` | hậu tố `Dto` — `SendCodeDto` |

`interface` tả MỘT hình dạng; `type` ghép hoặc suy ra từ hình dạng có sẵn
(`TApiResponse = IApiEnvelope | IApiError`). Nhìn tên là biết loại và biết nằm
ở thư mục nào, không phải mở tệp ra xem. Áp dụng cho cả `shared/`.

**Gói `@nook/shared` phải được dịch TRƯỚC.** `dist/` của nó không nằm trong git,
nên sau mỗi lần `git pull` thì bản dịch trên máy là bản CŨ — và backend báo lỗi
vào những dòng hoàn toàn đúng, kiểu `'jti' does not exist in type ITokenClaims`
trong khi `jti` nằm sờ sờ ở nguồn.

Không phải nhớ mà gõ: `predev`, `prebuild`, `pretypecheck`, `pretest` đều chạy
`tsc -p ../shared/tsconfig.json` trước. Mọi đường vào trình biên dịch đi qua đó.
Đang sửa nhiều bên `shared` thì mở thêm cửa sổ `npm run dev -w @nook/shared`.

**`incremental` phải để `false`.** Bộ nhớ đệm dịch (`*.tsbuildinfo`) chỉ theo
dõi tệp trong `src/`. Bản dịch của `@nook/shared` nằm ngoài đó, nên sửa một
kiểu bên gói dùng chung rồi dựng lại thì bộ nhớ đệm **không biết mình đã cũ** —
`nest start --watch` báo lỗi vào một dòng hoàn toàn đúng, kiểu ngồi soi bằng
mắt cả buổi không ra. Đã xảy ra thật: `TokenClaims` có `jti` ở cả nguồn lẫn bản
dịch, mà watch vẫn kêu `'jti' does not exist`; xoá `tsconfig.build.tsbuildinfo`
là hết.

Giá của việc tắt: **0,9 giây** mỗi lần dịch đầy đủ (3,0s so với 2,3s trên 147
tệp), và bằng 0 trong lúc watch chạy vì tsc giữ hết trong bộ nhớ. Cách "đúng
bài" hơn là dùng project references của TypeScript, nhưng Nest CLI chạy `tsc`
thẳng chứ không chạy `tsc -b` nên references không tự dựng — đổi lấy một lớp
phức tạp mới để tiết kiệm 0,9 giây thì không đáng.

Hai bẫy trên cùng một triệu chứng — "cái này rõ ràng có mà nó bảo không có" —
nay đều đã chặn sẵn: `incremental` tắt, và `shared` tự dịch lại trước mọi lệnh.
Nếu vẫn gặp thì `rm -f backend/*.tsbuildinfo` rồi chạy lại.

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
