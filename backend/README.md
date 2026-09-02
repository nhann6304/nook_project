# Nook — backend

NestJS trên Fastify · PostgreSQL · Redis · TypeORM · Socket.IO · BullMQ.
**Đăng nhập bằng email đã chạy được đầu-tới-cuối.**

```bash
./setup/mac/run.sh be             # cửa sổ 1 — server
./backend/scripts/smoke-auth.sh   # cửa sổ 2 — 15 bước của luồng đăng nhập
./backend/scripts/smoke-admin.sh  #            9 bước của đường quản trị
./backend/scripts/smoke-media.sh  #           15 bước của đường ảnh, bằng ảnh THẬT
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

### Ảnh

| | Đường | |
|---|---|---|
| `POST` | `/v1/media/upload-url` | xin giấy phép tải lên đã ký |
| `PUT` | *(đường đã ký)* | **app đẩy thẳng lên kho — không qua server** |
| `POST` | `/v1/media/:id/complete` | server soi lại trong kho rồi mới nhận |
| `GET` | `/v1/media/:id` | 302 sang đường xem đã ký |
| `PATCH` | `/v1/me` | `{ avatarMediaId }` — trỏ hồ sơ vào ảnh đã tải xong |

Xem mục 8.

### Quản trị

| | Đường | Vai |
|---|---|---|
| `GET` | `/v1/admin/stats` | `admin` `root` |
| `GET` | `/v1/admin/users` | `admin` `root` |

Hai cổng, đúng thứ tự: cổng thẻ hỏi *"anh có phải là ai đó không"* (401), cổng
vai hỏi *"người đó vào được đây không"* (403). Gộp làm một thì app không phân
biệt được "đăng nhập lại đi" với "tài khoản này không có quyền", mà hai câu đó
dẫn người dùng đi hai hướng ngược nhau.

**Vai đọc từ BẢNG, không đọc từ thẻ.** Nhét vai vào thẻ thì nhanh hơn một câu
truy vấn, nhưng hạ một admin xong họ vẫn còn quyền tới khi thẻ hết hạn — mười
lăm phút, đúng mười lăm phút mà người ta muốn chặn ngay.

### Tài khoản gốc — tạo sẵn, không xoá được

Migration `RootAdmin` tạo sẵn một tài khoản vai `root` với email
`root@nook.local` (hoặc `ROOT_ADMIN_EMAIL` nếu khai lúc chạy migration). Địa chỉ
mặc định đó không có thật nên **không ai đăng nhập vào nó được** — nó là chỗ giữ
vai, không phải một lối vào.

Khai `ROOT_ADMIN_EMAIL` bằng email THẬT rồi bật server: `RootAdminService` phong
vai `root` cho tài khoản đó (chưa có thì mở sẵn), nên lần đăng nhập đầu tiên đã
là root. **Không có API nào phong `root`** — người đầu tiên phải tới từ bên
ngoài hệ thống, nếu không thì gà và trứng.

Không xoá được, và chặn bằng **trigger trong cơ sở dữ liệu** chứ không bằng mã:

```
DELETE FROM users WHERE role='root';
  ERROR:  root admin cannot be deleted (user f2c1b627-...)
UPDATE users SET deleted_at = now() WHERE role='root';
  ERROR:  root admin cannot be soft-deleted (user f2c1b627-...)
```

Chặn ở tầng mã thì chỉ chặn được đường đi qua mã — còn `psql`, còn lệnh dọn dữ
liệu, còn một migration viết vội lúc nửa đêm. Hạ vai thì KHÔNG chặn: phải có
đường bàn giao. Lỡ hạ hết thì lần bật server sau `ROOT_ADMIN_EMAIL` dựng lại.

### Chưa có

`AchievementService.evaluate()` đã viết đủ nhưng **chưa ai gọi** — nó chỉ chạy
từ chặng 3, khi có góc bạn bè và ký ức thật làm con đếm nhúc nhích. Nên bây giờ
`/v1/me/achievements` có thể hiện `value` đã vượt `threshold` mà `unlockedAt`
vẫn `null`. Đúng, không phải lỗi.

## 2. Cây thư mục — ba tầng, ba vai

```
src/
├── core/          KHUNG. Không biết một chữ nào về nghiệp vụ Nook.
│   ├── context/      RequestContext — ai đang thao tác
│   ├── decorator/    @Public @CurrentUser @Message @Roles @ApiResult @ApiErrors
│   ├── dto/          vỏ câu trả lời · lỗi · lật trang · hồ sơ
│   ├── error/        AppException
│   ├── filter/ interceptor/ middleware/ pipe/
│   ├── interface/    IAuthUser
│   ├── mapper/       BaseMapper
│   ├── repository/   BaseRepository · GenericRepository · RepositoryManager
│   ├── service/      BaseCrudService
│   └── transaction/  TransactionService · @Transactional
│
├── database/      KẾT NỐI THẬT. data-source · entity/ · migration/
├── repository/    KHO THEO BẢNG. user/ session/ achievement/ — dùng chung mọi khán giả
│
├── apis/          TÍNH NĂNG, chia theo KHÁN GIẢ
│   ├── auth/         đăng nhập — CẢ HAI khán giả đi qua đây
│   ├── app/          app React Native   → /v1/...
│   │   ├── user/ achievement/ setting/
│   ├── admin/        web quản trị       → /v1/admin/...  (đều @Roles)
│   │   ├── stats/ user/ bootstrap/
│   └── health/
│
├── config/        env/ logger/ swagger/
├── infra/         redis/ notify/
├── realtime/      gateway/ adapter/
└── queue/
```

Trong mỗi module: `controller/` `service/` `mapper/` `dto/`, mỗi thư mục một
`index.ts`, gốc module chỉ có `*.module.ts`.

### Sáu luật, và có bộ soi

```bash
npm run check:arch     # chiều phụ thuộc giữa các tầng — 6 luật
npm run check:public   # có ai vừa mở thêm cửa cho người chưa đăng nhập không
node scripts/check-guard.mjs   # gõ THẬT vào từng cửa, không cầm thẻ
```

Hai cái đầu chạy trong `npm run check`, nên **push cũng chạy**.

1. **`core/` không được nhập từ `apis/`.** Khung không biết nghiệp vụ. Bộ soi này
   bắt được một chỗ ngay hôm dựng nó: `@CurrentUser()` nằm ở khung mà đi lấy
   kiểu `IAuthUser` từ `apis/auth/`. Nghĩ kỹ thì "ai đang gọi" đúng là chuyện của
   khung — `IAuthUser` chuyển sang `core/interface/`.
2. **`repository/` không thuộc về khán giả nào.** App và web quản trị hỏi cùng
   bảng `users`. Nhét kho vào thư mục của một bên là để bên kia phải với sang.
3. **`apis/app/` và `apis/admin/` không được với sang nhau.** Cái GIỐNG nhau là
   câu truy vấn, đã nằm ở `repository/`. Cái KHÁC nhau — controller, dto,
   mapper — mỗi bên giữ của mình.

Luật chỉ nằm trong tài liệu thì mục. Luật có bộ soi thì không.

### Vì sao chia theo khán giả

App React Native và web quản trị nhìn cùng một bảng nhưng được thấy hai thứ
khác nhau và làm được hai việc khác nhau. `UserProfileDto` (app) không có `role`
hay `lastSeenAt`; `AdminUserDto` (web) có. Gộp chung một module rồi phân nhánh
bằng `if (isAdmin)` là cách nhanh nhất để một hôm nào đó app trả ra thứ chỉ
quản trị mới được thấy.

Đăng nhập thì **dùng chung**: admin là một người dùng có vai khác, không phải
một hệ thống tài khoản thứ hai. Dựng hai hệ thống tài khoản là dựng hai chỗ để hở.

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

## 4. Ảnh — bản gốc giữ nguyên, mãi mãi

**Không thu nhỏ, không nén lại, không đổi định dạng.** Không có `sharp`, không
có `resize`, không có `quality` ở đâu trong mã. Bytes vào kho đúng bằng bytes
máy ảnh chụp ra, và không có đường nào xoá bản gốc. Đó là sản phẩm — bóp ảnh
của Nook thì Nook không còn là Nook.

Bản nhẹ cho bảng tin và cho widget (chặng sau) là **dòng khác trong bảng**, trỏ
tới bản sao dựng từ bản gốc. Bản sao xoá lúc nào cũng được vì dựng lại được.

### Bytes không đi qua server

```
1. POST /v1/media/upload-url    server ghi dòng `pending`, ký một giấy phép PUT
2. PUT  <đường đã ký>           app đẩy thẳng lên kho  ← không qua Node
3. POST /v1/media/:id/complete  server tự soi trong kho rồi mới chuyển `ready`
```

Một tấm ảnh 12MB đi qua Node là tốn hai lần băng thông, chiếm bộ nhớ suốt lúc
tải, và mười người tải cùng lúc là 120MB nằm trong một tiến trình một luồng.

Bước 3 không thừa: không có nó thì ai cũng gọi `complete` cho một tấm ảnh chưa
từng tồn tại, và bảng đầy dòng `ready` trỏ vào hư không. Server hỏi kho
(`HeadObject`) rồi so dung lượng với lời khai — **kho là bên nói thật, không
phải app.**

`ContentType` và `ContentLength` nằm trong chữ ký, nên khai 2MB rồi đẩy 200MB
là **kho** từ chối. Đó mới là chỗ chặn thật, không phải câu `if` ở tầng mã.

### Ảnh này của ai, và ai được xem

`media.owner_id` là người tải lên. Nhưng **quyền xem không nằm ở bảng `media`** —
nó nằm ở chỗ tấm ảnh được gắn vào:

| `kind` | Ai xem được |
|---|---|
| `avatar` | người trong góc của chủ ảnh *(chặng sau)* |
| `moment` | chỉ những người khoảnh khắc đó gửi tới *(chặng sau)* |

Cùng một tấm gắn vào hai khoảnh khắc là hai tập người xem khác nhau. Chép danh
sách quyền vào bảng ảnh là chép lại một sự thật đã nằm chỗ khác, và hai bản chép
thì sẽ có ngày lệch nhau.

**Chặng này chưa có góc bạn bè nên luật tạm là: chỉ chủ ảnh xem được.** Luật đặt
ở MỘT chỗ (`MediaService.readUrl`), không rải ở từng cửa gọi tới ảnh — rải ra thì
sẽ có một cửa quên kiểm, và cửa đó là chỗ ảnh riêng tư rò ra ngoài.

### Vì sao `GET /v1/media/:id` trả 302 chứ không trả đường ký trong JSON

Đường đã ký sống vài phút, mà app thì lưu lại câu trả lời. Một đường hỏng sau
năm phút nằm trong bộ nhớ đệm của app là thứ rất khó lần ra.

`/v1/media/<id>` thì **ổn định** — dán vào thẻ ảnh, vào bộ nhớ đệm, vào đâu cũng
được. Mỗi lần tải là một lần ký lại, và **quyền xem được kiểm đúng lúc xem**,
không phải lúc câu trả lời được tạo ra. Cái chuyển hướng để `no-store`; tệp ảnh
ở đầu kia thì cứ cho lưu thoải mái.

### Bản nhẹ — bắt buộc phải có

|  | rộng | nặng |
|---|---|---|
| bản gốc iPhone | 4032 px | ~3 MB |
| màn hình cần | 1290 px | — |
| `feed` | 1290 px | ~200 KB |
| `thumb` (hàng mặt, ảnh đại diện) | 320 px | ~12 KB |

Cuộn 20 tấm: bản gốc là **60 MB**, bản `feed` là **4 MB**. Trên 4G đó là khác
biệt giữa 40 giây và 3 giây, cộng một hoá đơn dữ liệu.

**Là bản sao THÊM, không thay bản gốc.** Bảng riêng (`media_variants`) chứ không
phải cột `feed_key`, `thumb_key` trên `media` — hai thứ có vòng đời khác hẳn
nhau: bản gốc giữ mãi mãi và không xoá được; bản nhẹ dựng ở việc nền, hỏng
được, dựng lại được, và mai mốt đổi kích thước là dựng lại toàn bộ. Thêm một cỡ
mới là thêm một DÒNG, không phải thêm một cột.

Dựng ở **việc nền** (BullMQ + sharp), không dựng lúc tải xong: kéo 12MB về bộ
nhớ rồi nén mất vài trăm mili giây và chiếm luồng duy nhất của Node — trong
đường request thì đó là chặn mọi người khác. Ảnh dùng được ngay bằng bản gốc.

Xin bản nhẹ chưa dựng xong thì server trả **bản gốc**, không trả lỗi: chậm một
lần còn hơn một ô ảnh trống.

```
GET /v1/media/<id>                 bản gốc
GET /v1/media/<id>?variant=feed    bản feed, chưa có thì rơi về bản gốc
GET /v1/media/<id>?variant=thumb
```

`.rotate()` không tham số trong worker là **áp dụng hướng xoay ghi trong EXIF**.
Thiếu nó thì ảnh chụp dọc ra bản nhẹ nằm ngang — bản gốc vẫn đúng vì nó còn thẻ
EXIF, còn bản nhẹ thì đã mất thẻ đó.

`withoutEnlargement`: ảnh vốn nhỏ hơn thì để yên. Phóng to chỉ làm tệp nặng
thêm mà không nét thêm chút nào.

**sharp đọc được HEIF/HEIC** — bản dựng sẵn 0.35 đã kèm libheif, nên nhận thẳng
ảnh iPhone, không phải bắt app chuyển sang JPEG.

### Chọn kho nào: MinIO hay R2

**MinIO chỉ để dev trên máy mình. Mọi thứ người dùng thật chạm vào thì R2.**

Treo MinIO trên laptop để phục vụ người dùng thật là hỏng ở bốn chỗ, và chỗ nào
cũng đủ để chết:

- laptop ngủ, đổi wifi, mất điện — ảnh biến mất trong lúc đó
- nhà mạng đổi IP liên tục, điện thoại ngoài mạng 4G không vào được nếu không
  mở cổng hoặc dựng đường hầm
- không HTTPS thì iOS chặn thẳng
- **laptop hỏng là mất sạch ảnh gốc** — và ảnh gốc không dựng lại được

Bậc miễn phí của R2 cho 10–20 người đầu: **10 GB chỗ chứa** (cỡ 3000 tấm ảnh
3MB) và **không mất tiền băng thông ra** — mà băng thông ra mới là thứ tốn với
một app xem ảnh. Thực tế là 0 đồng ở giai đoạn này.

MinIO vẫn giữ, vì nó tốt cho đúng việc của nó: dev không cần mạng, không cần
tài khoản, `docker compose down -v` là sạch bách làm lại.

#### Chuyển sang R2 — đổi bốn dòng

```bash
STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_BUCKET=nook-media
STORAGE_KEY_ID=<R2 access key id>
STORAGE_SECRET=<R2 secret>
```

Hết. Không đụng một dòng mã nào. Kiểu đường dẫn tự nhận ra từ tên miền, và
`storage_provider` của từng tấm tự ghi theo kho đang dùng.

Bên Cloudflare: **R2 → Create bucket** (đặt tên `nook-media`, để **private**) →
**Manage R2 API Tokens → Create API token**, quyền *Object Read & Write*, giới
hạn đúng thùng đó. Account ID nằm ngay trên trang R2.

Bật server lên, `StorageCheck` **ghi thật một tệp bé rồi xoá** — sai khoá hay
sai tên thùng là nó kêu ngay lúc bật, kèm câu chỉ rõ phải sửa biến nào:

```
ERROR [StorageCheck] Storage is not usable (minio): The request signature we
calculated does not match the signature you provided.
  Check STORAGE_ENDPOINT / STORAGE_BUCKET / STORAGE_KEY_ID / STORAGE_SECRET.
```

Bản thật thì hỏng là **chết luôn**, không bật. Server không chứa được ảnh thì
nó không làm được việc của nó. Máy dev thì chỉ kêu, để còn ngồi làm được lúc
không có mạng.

#### Đã có ảnh ở kho cũ rồi thì sao

```bash
STORAGE_LEGACY_ENDPOINT=http://localhost:9000    # kho CŨ
STORAGE_LEGACY_BUCKET=nook-media
STORAGE_LEGACY_KEY_ID=nook
STORAGE_LEGACY_SECRET=nook12345

npm run storage:migrate -- --dry-run    # xem sẽ chép gì
npm run storage:migrate                 # chép thật
```

Ảnh mới vào kho mới, ảnh cũ đọc ở kho cũ, chép dần lúc rảnh. **Không dừng dịch
vụ, không mất tấm nào.** Lệnh chạy lại được nhiều lần — nó chỉ nhặt dòng còn ghi
kho cũ, nên đứt giữa chừng thì chạy tiếp. Chép xong tệp mới đổi cột, không đảo
ngược lại: đảo là có một khoảng dòng nói "tôi ở kho mới" mà tệp còn ở kho cũ.
Bản cũ **không bị xoá** — xoá là việc riêng, làm khi đã yên tâm.

### Vì sao code đã sẵn sàng để hoán đổi

Cùng giao thức S3, nên đường tải lên ở máy dev là **đường thật** — không phải
bản giả rồi lên thật mới phát hiện lệch. Ba thứ làm việc hoán đổi thành chuyện
đổi biến môi trường:

**Không phải khai kiểu đường dẫn.** MinIO cần `http://host/bucket/key`, R2 cần
`https://bucket.host/key`; đặt sai thì mọi lần tải lên trả 403 hoặc 404 và câu
lỗi của S3 không hé một chữ nào. Server **tự nhận ra từ tên miền**
(`detectProvider`), nên không ai đặt sai được nữa.

**Ghi vào MỘT kho, đọc được NHIỀU kho.** Mỗi dòng ảnh nhớ nó nằm ở kho nào
(`media.storage_provider`). Đây là cột quan trọng nhất của cả bảng: không có nó
thì ngày đổi MinIO sang R2, server đi tìm ảnh cũ ở kho mới và không thấy — **mất
sạch ảnh cũ**, mà mất ở đây là mất thật vì bản gốc không dựng lại được.

Có nó thì đổi kho là: trỏ `STORAGE_*` sang kho mới, khai thêm `STORAGE_LEGACY_*`
để đọc kho cũ, rồi chép dần sang lúc rảnh. Không dừng dịch vụ, không mất tấm nào.
Chép xong thì bỏ khối `LEGACY` đi.

Chọn R2 **không phải vì rẻ chỗ chứa** — chỗ chứa ở đâu cũng na ná. Vì R2 **không
thu tiền băng thông ra**. Nook là app xem ảnh: mỗi tấm tải lên một lần, xem hàng
trăm lần. Ở S3 thì chính cái "hàng trăm lần" đó là hoá đơn.

### Đã đo

`scripts/smoke-media.sh` tải lên một tấm PNG 1.4MB thật rồi tải về, so **sha256**:

```
Ảnh thử: 1471213 byte · sha256 d4af8f3575246bd5…
  ✓ tải về nguyên vẹn — sha256 KHỚP
  ✓ dung lượng tải về == lúc gửi
```

```
feed:  700px  349728 byte   (4.2x nhẹ hơn)
thumb: 320px   44072 byte  (33.4x nhẹ hơn)
  ✓ bản GỐC vẫn nguyên sau khi dựng bản nhẹ
```

Cùng 20 bước: chưa tải mà báo xong thì chặn, người khác không xem được, không
thẻ không xem được, ảnh người khác không đặt làm đại diện được, tệp quá to và
định dạng lạ bị chặn ngay từ lúc xin đường, xin bản nhẹ không có tên thì chặn.

## 5. Bảng

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

## 6. Redis làm năm việc

1. Mã đăng nhập 6 số, tự chết sau 5 phút
2. Con đếm chống gọi quá dày
3. Hàng đợi việc nền (BullMQ)
4. Cầu nối cho socket khi chạy nhiều bản server
5. **Vị trí** — và cái này phải nói rõ: vị trí **không bao giờ** chạm vào
   Postgres. `EXPIRE 900` là 15 phút sau nó biến mất thật. Ghi vào Postgres thì
   nó còn nằm trong WAL và trong mọi bản sao lưu; "đã xoá" ở đó không có nghĩa
   là đã mất.

Việc gì cần **nhớ lâu** thì đi Postgres. Redis là chỗ của thứ được phép quên.

## 7. Socket là đường tắt, không phải lời hứa giao hàng

App bị đẩy ra nền là ống đứt, và nó đứt thường xuyên hơn nhiều so với cảm giác
lúc ngồi thử máy. Thứ bảo đảm tới nơi vẫn là **ghi vào cơ sở dữ liệu, rồi bắn
thông báo đẩy**. Socket chỉ làm người đang mở app thấy nhanh hơn vài giây.

Hệ quả: nối lại thì **hỏi lại bằng REST**, đừng phát lại qua ống. Ống không nhớ
nó đã bỏ lỡ những gì.

## 8. Sáu chỗ đã vấp — đừng vấp lại

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

**Luật gói: Nest làm được rồi thì đừng cài thêm.** Đã rà một lượt và gỡ:

| Gỡ | Vì sao |
|---|---|
| `nestjs-pino` `pino` `pino-http` `pino-pretty` | `ConsoleLogger` của Nest làm đủ, kể cả JSON cho bản thật |
| `@nestjs/passport` `passport` `passport-jwt` | ba gói cho ba việc mà `@nestjs/jwt` + `SessionService` đã làm |
| `@fastify/cookie` | chỉ phục vụ `CookieService`, mà cái đó chưa ai gọi |

Còn lại **27 gói**, và mấy gói trông "không được nhập ở đâu" đều có lý do thật:
`pg` do TypeORM nạp theo tên lúc chạy · `bullmq` do `@nestjs/bullmq` nạp ·
`@fastify/static` do SwaggerModule nạp (gỡ thử thì Nest báo thẳng
*"The @fastify/static package is missing"*) · `reflect-metadata` và `dotenv`
nhập kiểu side-effect nên không có chữ `from`.

**Log dùng `ConsoleLogger` có sẵn của Nest, không dùng pino.** Từng dùng pino;
bỏ, vì bốn lý do xếp theo sức nặng: (1) dòng log không còn ra hình dạng mà ai
làm Nest cũng nhận ra — `[Nest] pid - giờ  LOG [Context] câu chữ +5ms`;
(2) bớt bốn gói; (3) bản thật vẫn có JSON, chỉ cần `json: true`; (4) tốc độ của
pino chỉ đáng kể ở lượng log rất lớn, chưa tới lúc đó.

Một request = **một dòng**, và nó là **hook `onResponse` của Fastify** chứ không
phải bộ chặn của Nest — bộ chặn chỉ chạy khi có controller nhận, nên 404 sẽ
không được ghi, mà 404 lại đúng là thứ đáng ghi khi app gọi sai đường. Mã lỗi
do `AllExceptionFilter` gắn lên `req.raw` rồi hook đọc ra, nên không phải in
thêm một dòng nữa chỉ để nói mã:

```
LOG  [HTTP] POST /v1/auth/code 200 69ms
WARN [HTTP] POST /v1/auth/verify 400 54ms auth.code_invalid
WARN [HTTP] GET /khong-co 404 1ms common.not_found
```

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

**Bản dịch cũ của `@nook/shared` — bẫy đắt nhất, đã chặn ở hai lớp.**

`shared/dist/` không nằm trong git. Sau mỗi lần `git pull` thì bản dịch trên máy
là bản CŨ, và backend báo lỗi vào những dòng hoàn toàn đúng:

```
'@nook/shared' has no exported member named 'ITokenClaims'. Did you mean 'TokenClaims'?
'jti' does not exist in type 'TokenClaims'
```

Hai lớp chặn, vì hai chỗ đọc kiểu là hai chỗ khác nhau:

| Ai đọc | Đọc ở đâu | Chặn bằng |
|---|---|---|
| VSCode, `npm run typecheck` | **nguồn** `shared/src` | `paths` trong `tsconfig.json` |
| `nest build` | bản dịch `shared/dist` | `pre*` dựng lại trước |

Lớp thứ nhất quan trọng hơn: mấy cái `pre*` chỉ chữa được dòng lệnh, **không
chữa được trình soạn thảo** — VSCode chạy trình biên dịch riêng của nó và đọc
thẳng `dist`. Trỏ `paths` về nguồn thì gạch đỏ không bao giờ cũ được nữa.

Đổi lại: `rootDir` và `outDir` phải chuyển hết sang `tsconfig.build.json`. Để ở
`tsconfig.json` thì tsc kéo tệp của gói dùng chung vào chương trình rồi đòi xuất
chúng ra, mà chúng nằm ngoài `rootDir` — lỗi `TS6059`.

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

**Gọi log kiểu pino thì Nest nuốt mất vết ngăn xếp.** `ConsoleLogger` có chữ ký
`(message, stack)`; gọi `log.error({obj}, 'msg')` như pino thì đối tượng bị in
thành câu chữ còn câu chữ bị coi là vết ngăn xếp, nên **vết ngăn xếp thật biến
mất** — đúng thứ cần nhất lúc có lỗi 500. Đã xảy ra thật: một lỗi 500 ở
`/v1/media/:id/complete` không cho biết gì cả cho tới khi sửa chỗ gọi log, rồi
nguyên nhân hiện ra ngay dòng đầu (`Custom Id cannot contain :` — BullMQ không
nhận dấu hai chấm trong mã việc).

**Node 22 hoặc 24, đừng dùng 23.** Vài thư viện khai `engines` là
`^20.19 || ^22.13 || >=24`; bản lẻ nằm ngoài lời hứa đó.

## 9. Cổng thẻ — chưa đăng nhập là không vào được gì

**Mặc định là ĐÓNG.** `JwtAccessGuard` gắn toàn cục (`APP_GUARD`), nên đường mới
viết ra đã có cổng; `@Public()` là cách duy nhất mở ra. Làm ngược lại — mở sẵn
rồi nhớ mà đóng — thì cái quên đầu tiên là một lỗ hổng, chứ không phải một lỗi
401 dễ thấy.

Đúng **5 cửa mở**, và cả 5 đều có lý do: bốn cửa đăng nhập (chưa có thẻ thì lấy
đâu ra thẻ) và `/health` (bộ cân bằng tải gõ, không cầm thẻ).

Hai lớp soi, vì hai chuyện khác nhau:

| Bộ soi | Đọc gì | Bắt được gì |
|---|---|---|
| `check:public` | **mã nguồn** | ai đó vừa dán thêm `@Public()` |
| `check-guard.mjs` | **server đang chạy** | cổng bị hở vì lỗi nối dây ở chỗ khác |

Cái thứ hai quan trọng hơn: mã nguồn có thể đúng mà cổng vẫn hở — dán
`APP_GUARD` nhầm module, hay một controller quên nằm trong cây module. Nó gõ
thật vào **từng cửa một** không cầm thẻ, và đòi đúng `401 auth.unauthorized`.

Ống socket cũng là một cái cửa, và cũng bị soi: nối không thẻ và nối bằng thẻ
bịa đều phải bị cắt.

```
DAT - 15/15   (13 cửa HTTP + 2 lối vào socket)
```

## 10. Ranh giới với frontend

**Màn hình không biết server tồn tại.** Mọi lệnh gọi mạng của app nằm gọn trong
`frontend/src/features/<tên>/lib/*Api.ts`. Hiện có đúng một file như vậy:
`authApi.ts`, và nó vẫn là **hàng giả** (mã đúng: `123456`).

Nối backend = **thay ruột file đó**, không sửa một màn hình nào. Nếu thấy mình
đang phải sửa file trong `frontend/src/features/*/screens/` để nối server —
dừng lại, ranh giới đang bị cắt qua.

Đường dẫn, mã lỗi, giới hạn thì lấy từ `@nook/shared`, đừng gõ lại chuỗi.
