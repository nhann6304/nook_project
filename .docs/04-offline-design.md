# Nook — Bản thiết kế phần chạy khi mất mạng

[`03-offline.md`](03-offline.md) nói **luật**: mất mạng thì xem được gì, làm được
gì, nói với người dùng thế nào. File này nói **cách làm**: kho nào, bảng nào,
cửa nào, theo thứ tự nào.

Chưa có dòng mã nào theo file này. Viết trước vì có hai thứ **bắt buộc phải
quyết trước khi viết đường ghi đầu tiên** (mục 5 và 6) — nhét vào sau là đi sửa
cả hai bên cùng lúc.

---

## 0 · Kết luận đặt lên đầu: **không cần development build**

Câu hỏi đang treo ở `frontend/CLAUDE.md` — *"có chuyển sang development build
không"* — **không chặn việc này.** Đã tra `expo/bundledNativeModules.json` của
SDK 54 đang cài:

| Cần gì | Gói | SDK 54 ghim | Expo Go |
|---|---|---|---|
| Bảng ở máy | `expo-sqlite` | ~16.0.10 | ✅ |
| Tệp ảnh | `expo-file-system` | ~19.0.24 | ✅ |
| Đoán còn mạng không | `expo-network` | ~8.0.8 | ✅ |
| Thẻ phiên | `expo-secure-store` | ~15.0.8 | ✅ đã cài |
| Lựa chọn nhỏ (ngôn ngữ, bảng màu) | `async-storage` | 2.2.0 | ✅ đã cài |
| **Gửi tiếp lúc app đã đóng** | `expo-background-task` | ~1.0.10 | ❌ |

Chỉ **một** dòng cuối cần dev build, và nó là thứ *thêm vào*: không có nó thì
hàng đợi chạy mỗi khi app mở, có nó thì chạy cả khi app đóng. Người dùng không
mất chức năng nào — ảnh chỉ gửi muộn hơn.

`react-native-mmkv` vẫn không chạy trên Expo Go, nhưng thiết kế này **không cần**
MMKV: thứ nặng nằm ở SQLite, thứ nhẹ đã có AsyncStorage.

---

## 1 · Bốn kho, mỗi kho một loại — đừng nhầm chỗ

| Kho | Đựng gì | Vì sao chính nó |
|---|---|---|
| `expo-secure-store` | thẻ dài hạn, thẻ ngắn hạn | Keychain/Keystore. Máy đã root cũng không đọc được |
| **SQLite** (`expo-sqlite`) | khoảnh khắc, tin nhắn, góc bạn, hồ sơ, thông báo, hàng đợi gửi | Có **truy vấn** và **chỉ mục**. Đọc *đồng bộ* được nên vẽ màn đầu không nhấp nháy |
| `FileSystem` — thư mục **cache** | ảnh tải VỀ | Tải lại được. iOS dọn khi máy đầy — chấp nhận được |
| `FileSystem` — thư mục **document** | ảnh **chờ gửi** | Bản duy nhất trên đời. iOS **không** dọn thư mục này |
| `AsyncStorage` | ngôn ngữ, bảng màu | Đã có sẵn, đủ dùng, không đụng vào |

### Vì sao SQLite chứ không phải AsyncStorage

AsyncStorage trên **Android có trần 6MB** mặc định cho cả kho. Feed 48 giờ với
góc 10 người là vài trăm dòng chữ — chưa chạm trần. Nhưng nó không có truy vấn:
"lấy 20 khoảnh khắc mới nhất" thành ra *đọc hết, đổi từ JSON, sắp xếp trong JS*.
Với `<List>` (FlashList) thì đó đúng là chỗ giật.

### Cái bẫy: `cache` và `document` không thay nhau được

iOS **xoá thư mục cache** khi máy sắp đầy, không hỏi ai. Đặt ảnh chờ gửi vào đó
là một ngày nào đó nó biến mất — và ảnh chưa gửi thì **không tải lại được từ
đâu**. Đây chính là luật tuyệt đối ở [`03-offline.md`](03-offline.md) mục 4.2,
viết lại thành một câu kỹ thuật:

> Ảnh tải về → `Paths.cache`. Ảnh chờ gửi → `Paths.document`. Không bao giờ ngược lại.

Chiều ngược cũng có giá: để ảnh tải về vào `document` là chúng bị **sao lưu lên
iCloud** — mấy chục MB ảnh tải lại được nằm trong bản sao lưu của người dùng,
vừa vô duyên vừa dễ bị soi lúc duyệt store.

> ⚠ **SDK 54 đổi API của `expo-file-system`.** Bản 19 dùng `File` / `Directory` /
> `Paths`; `FileSystem.documentDirectory` kiểu cũ nằm ở `expo-file-system/legacy`.
> Chép code trên mạng về là gặp bản cũ — nhớ kiểm.

---

## 2 · Ảnh — cái bẫy đường ký, và cách gỡ

`GET /v1/media/:id` trả **302** sang một đường đã ký, và **đường ký thì hết hạn**.
Nghĩa là cùng một tấm ảnh, hôm nay là một URL, mai là URL khác.

Mọi bộ nhớ đệm ảnh (kể cả của `expo-image`) đánh dấu theo **URL**. Nên nếu để
nguyên: đường ký đổi → coi như ảnh mới → tải lại → **mất mạng là mất ảnh**, dù
tấm đó đang nằm sờ sờ trên máy.

**Cách gỡ: đừng đánh dấu theo URL, đánh dấu theo `mediaId`.** App tự giữ tệp:

```
Paths.cache/media/<mediaId>.<variant>.webp
```

và một dòng trong bảng `media_file`. Màn hình không bao giờ nhận URL — nó nhận
`mediaId`, hỏi kho, ra `file://…`:

```tsx
<Img source={{ uri: 'file:///…/media/abc123.feed.webp' }} />
```

Được ba thứ cùng lúc: mất mạng vẫn hiện · đường ký đổi không ảnh hưởng gì ·
biết chính xác đang giữ những gì để mà dọn.

**Bản nào tải sẵn:**

| Chỗ | Bản | Khi nào tải |
|---|---|---|
| lướt feed | `feed` | tải ngầm ngay khi đồng bộ xong, không đợi cuộn tới |
| ô vuông nhỏ, góc bạn | `thumb` | như trên |
| mở to / lưu về máy | **gốc** | chỉ khi người dùng bấm |

**Trần dung lượng:** đo thử — feed 48 giờ, góc 10 người, mỗi người vài tấm ≈
**100 tấm**. Bản `feed` webp ~150KB → **~15MB**. Không cần luật dọn, không cần ô
cài đặt: **trần 48 giờ đã là trần dung lượng**. Dọn gói trong đúng một câu: xoá
tệp của khoảnh khắc đã bị xoá khỏi bảng ở máy. Xem mục 11 câu 2.

Tệp bị iOS dọn mất thì `<Img>` báo `onError` → đánh dấu thiếu → có mạng thì tải
lại. Không đi `getInfoAsync` từng tấm trước khi vẽ: đó là một lần chạm đĩa cho
mỗi hàng trong danh sách, để đổi lấy một chuyện gần như không xảy ra.

---

## 3 · Bảng ở máy

Đặt ở `frontend/src/lib/db/` (TS thuần, không React — đúng luật `07-architecture.md`).

```sql
PRAGMA journal_mode = WAL;     -- đọc không chặn ghi: đồng bộ chạy trong lúc đang cuộn

CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);   -- con trỏ đồng bộ, phiên bản lược đồ

CREATE TABLE person (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, username TEXT,
  avatar_media_id TEXT, is_me INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL);

CREATE TABLE circle_member (
  person_id TEXT PRIMARY KEY, state TEXT NOT NULL,   -- active | invited | pending
  level INTEGER NOT NULL DEFAULT 0,                  -- cấp thân CỦA CẶP MÌNH–HỌ, không của ai khác
  dormant INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL);

CREATE TABLE moment (
  id TEXT PRIMARY KEY, author_id TEXT NOT NULL, media_id TEXT, caption TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  local_state TEXT,      -- NULL = từ server | pending | sending | failed
  local_path TEXT);      -- ảnh chưa gửi nằm ở đâu
CREATE INDEX moment_by_time ON moment(created_at DESC);

CREATE TABLE reaction (                              -- tim: RIÊNG TƯ giữa hai người
  moment_id TEXT NOT NULL, person_id TEXT NOT NULL, kind TEXT NOT NULL,
  created_at TEXT NOT NULL, PRIMARY KEY (moment_id, person_id));

CREATE TABLE message (
  id TEXT PRIMARY KEY, thread_id TEXT NOT NULL, author_id TEXT NOT NULL,
  body TEXT, moment_id TEXT, created_at TEXT NOT NULL, local_state TEXT);
CREATE INDEX message_by_thread ON message(thread_id, created_at);

CREATE TABLE notification (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL, payload TEXT NOT NULL,
  created_at TEXT NOT NULL, read_at TEXT);

CREATE TABLE media_file (
  media_id TEXT NOT NULL, variant TEXT NOT NULL,     -- feed | thumb
  path TEXT NOT NULL, bytes INTEGER NOT NULL, PRIMARY KEY (media_id, variant));

CREATE TABLE outbox (
  client_id TEXT PRIMARY KEY,   -- uuid, đi theo VIỆC chứ không theo lần thử
  kind TEXT NOT NULL,           -- moment.create | reaction.set | message.send | profile.patch
  order_key TEXT,               -- cùng khoá thì gửi TUẦN TỰ; NULL thì gửi song song
  payload TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending',   -- pending | sending | failed_soft | failed_hard
  attempts INTEGER NOT NULL DEFAULT 0, next_try_at TEXT NOT NULL,
  last_error TEXT, created_at TEXT NOT NULL);
CREATE INDEX outbox_ready ON outbox(state, next_try_at);
```

**Không có bảng `memory`, không có cột cấp thân của người khác.** Cấp thân chỉ
tồn tại ở `circle_member.level` — cặp *mình và họ*. Đó là luật sản phẩm, và để
nó rò ra thì nó rò ngay ở tầng kho, chỗ khó soi nhất.

**Lược đồ đổi thì làm sao:** `meta['schema']` giữ số phiên bản. **Không viết bộ
di trú cho app** — dữ liệu ở máy tải lại được hết. Lệch phiên bản thì `DROP`
sạch, đặt con trỏ về rỗng, kéo lại từ đầu. Rẻ hơn nhiều so với nuôi hai bộ di
trú ở hai bên. **Ngoại lệ duy nhất: `outbox` và ảnh chờ gửi không được xoá** —
chúng không có bản nào ở server.

---

## 4 · Cửa `GET /v1/sync` — "gọi xuống trước một phần"

### 4.1 Trả một DÒNG THAY ĐỔI, không phải mấy cái giỏ

Cách hay gặp là trả `{ moments: [...], messages: [...], circle: [...] }`. Bỏ cách
đó, vì hai lý do:

1. **Mất thứ tự giữa các loại.** Một cái tim trỏ vào khoảnh khắc chưa về là một
   dòng mồ côi. Một dòng chảy duy nhất thì thứ tự tự đúng.
2. **Vỏ câu trả lời đã dàn phẳng sẵn cho đúng hình dạng này.** `ResponseInterceptor`
   nhận đúng `{ items, nextCursor }` (nó kiểm chặt: đúng hai trường, không hơn)
   rồi đẩy con trỏ ra `metadata`. Trả dòng chảy là **không phải sửa một dòng nào**
   ở tầng khung.

```ts
// shared/src/sync/interface/sync.interface.ts
export interface ISyncChange {
  /** Con trỏ của CHÍNH bản ghi này. Áp xong thì ghi ngay số này xuống. */
  seq: string;
  entity: TSyncEntity;              // person | circle_member | moment | reaction | message | notification
  op: 'put' | 'del';
  id: string;
  /** `null` khi `op` là `del`. */
  row: Record<string, unknown> | null;
}
```

Ra tới app:

```jsonc
{ "ok": true, "code": "ok", "status": 200,
  "data": [ { "seq": "…", "entity": "moment", "op": "put", "id": "…", "row": {} } ],
  "metadata": { "requestId": "req-9", "serverTime": "…",
                "nextCursor": "…", "hasMore": true, "count": 200 } }
```

### 4.2 Áp từng dòng một, không phải từng lô

Đây là chỗ quyết định app có hỏng khi đứt mạng giữa chừng hay không:

> Áp **một** dòng → ghi `meta['cursor'] = change.seq` → sang dòng sau.

Đứt ở dòng thứ 137 thì lần sau chạy tiếp từ 137: không làm lại từ đầu, và không
có lô nào áp được một nửa. Mỗi dòng là `INSERT … ON CONFLICT DO UPDATE` hoặc
`DELETE` — áp hai lần vẫn ra đúng một kết quả, nên trùng là vô hại.

### 4.3 Con trỏ: cái bẫy thứ tự commit, và **độ trễ an toàn 2 giây**

Con trỏ = `base64url("<changed_at ISO>|<id>")` — **cùng khuôn với `encodeCursor`
đã có** ở `core/repository/base.repository.ts`. Đừng chế khuôn thứ hai.

Cái bẫy thật nằm chỗ khác, và nó âm thầm: **hai giao dịch commit không theo thứ
tự chúng lấy dấu thời gian.** Giao dịch A ghi `changed_at = 10:00:00.100` nhưng
commit lúc `.400`; giao dịch B ghi `.300`, commit lúc `.350`. App đồng bộ đúng
lúc `.360` sẽ thấy B, đặt con trỏ `.300`, và **không bao giờ thấy A nữa**. Không
ai báo lỗi cả — chỉ là một tấm ảnh vĩnh viễn không tới.

Cách chặn, đúng một dòng `WHERE`:

```sql
AND changed_at < now() - interval '2 seconds'
```

Server **không bao giờ phát thứ vừa xảy ra trong 2 giây gần nhất**. Mọi giao
dịch của app này commit nhanh hơn thế rất nhiều. Cái giá: đồng bộ trễ tối đa 2
giây — không đáng kể, vì socket mới là đường lo tin nóng, `/v1/sync` là đường lo
*bắt kịp*.

Và tuyệt đối **không dùng đồng hồ của máy** ở bất kỳ đâu trong việc này. Con trỏ
do server phát; app chỉ cất và gửi lại nguyên si.

### 4.4 Xoá thì báo bằng gì

"Những gì đổi từ mốc X" không nhìn thấy được thứ **đã biến mất**. Nên: dùng
`SoftDeleteEntity` (đã có sẵn ở `database/entity/base/`) — dòng bị xoá vẫn nằm
lại với `deleted_at`, và sync phát nó ra dạng `op: 'del'`.

Bia mộ giữ **30 ngày** rồi dọn. Kèm theo là một luật:

> Con trỏ của app cũ hơn 30 ngày → server trả `sync.cursor_too_old`,
> **HTTP 410 GONE**. App xoá kho, đặt con trỏ rỗng, kéo lại từ đầu.

410 đúng là mã cần: *"thứ từng có nhưng đã hết hạn"*, nguyên văn mô tả trong
`HTTP_STATUS`. Đây là đường sống chứ không phải lỗi — app ba tháng không mở vẫn
quay lại được.

### 4.5 Server lấy dòng chảy đó ở đâu ra

**Đừng dựng bảng nhật ký thay đổi.** Sáu bảng, mỗi bảng một câu
`WHERE <người này thấy được> AND changed_at > cursor AND changed_at < now()-2s
ORDER BY changed_at, id LIMIT n+1`, rồi **trộn sắp xếp** trong service và cắt ở
`n`. Sáu câu nhỏ có chỉ mục, và **không phải thêm một lần ghi nào** vào các
đường ghi hiện có.

Ngưỡng phải đổi cách: khi một người có thể có hàng nghìn dòng đổi trong một lượt
đồng bộ. Với góc 10 người và feed 48 giờ thì còn xa.

**Phạm vi khoá theo người gọi, từng câu một** — đây là chỗ dễ rò nhất trong cả
server:

| Bảng | Chỉ lấy |
|---|---|
| `moment` | tác giả nằm trong góc của tôi, `created_at > now() - 48h` |
| `reaction` | tim của tôi, hoặc tim người khác **trên bài của tôi** |
| `message` | thread có tôi |
| `circle_member` | hàng của chính tôi — **cấp thân của cặp tôi–họ, không của cặp nào khác** |
| `person` | tôi + người trong góc tôi |

### 4.6 Hằng số, đường dẫn, mã lỗi

```ts
// shared/src/http/constant/route.constant.ts
sync: { pull: '/v1/sync' },

// shared/src/sync/constant/sync.constant.ts
export const SYNC = {
  lagSeconds: 2,        // mục 4.3
  tombstoneDays: 30,    // mục 4.4
  feedWindowHours: 48,
  pageLimit: 200,
} as const;

// shared/src/sync/constant/sync-error.constant.ts
export const SYNC_ERR = { CURSOR_TOO_OLD: 'sync.cursor_too_old' } as const;
```

---

## 5 · Ghi — hàng đợi, và chống trùng

> **Mục này phải xong TRƯỚC khi viết đường ghi đầu tiên** (`POST /v1/moments`).
> Nhét chống trùng vào sau là đổi cả lược đồ bảng lẫn mã app đang chạy.

### 5.1 Chống trùng bằng HÌNH DẠNG trước, bằng `client_id` sau

Mạng chậm rồi hết hạn chờ: app **không biết** server đã nhận chưa. Gửi lại là
bắt buộc. Nhưng phần lớn thao tác không cần cơ chế gì cả, nếu đặt cửa cho đúng:

| Việc | Cửa | Gửi lại hai lần |
|---|---|---|
| Thả / gỡ tim | `PUT /v1/moments/:id/reaction` `{kind}` hoặc `DELETE` | vô hại — đặt **trạng thái**, không phải "cộng thêm" |
| Sửa hồ sơ | `PATCH /v1/me` | vô hại |
| **Đăng khoảnh khắc** | `POST /v1/moments` | **đẻ hai bài** → cần `client_id` |
| **Gửi tin nhắn** | `POST /v1/threads/:id/messages` | **đẻ hai tin** → cần `client_id` |

Nên: **cửa nào tạo dòng mới thì mới cần `client_id`.** Ít chỗ hơn hẳn so với
"gắn vào mọi đường ghi", và mỗi chỗ có một lý do rõ.

Cách làm ở server — **đã có sẵn khuôn**, chính là `insertIfAbsent` trong
`repository/user/user-identity.repository.ts`:

```sql
INSERT INTO moments (…, client_id) VALUES (…)
ON CONFLICT ("author_id", "client_id") DO NOTHING
RETURNING "id"
```

Không có dòng trả về → nghĩa là đã tạo rồi → đọc dòng cũ ra và trả **đúng kết
quả cũ**, mã `200` chứ không phải `201`. App không phân biệt được, và cũng không
cần.

`client_id` là uuid do máy sinh **một lần cho mỗi việc**, không phải mỗi lần thử
— nó là khoá chính của bảng `outbox` nên chuyện đó tự đúng.

### 5.2 Thứ tự, và lùi dần

- `order_key = 'thread:<id>'` cho tin nhắn → **tuần tự trong cùng một thread**.
  Khoảnh khắc và tim để `NULL` → gửi song song, thứ tự không quan trọng.
- Lùi dần `1s → 2s → 4s …`, trần **5 phút**. Cộng nhiễu ngẫu nhiên ±20%, để mười
  cái máy vừa vào lại sóng không bắn cùng một nhịp.
- Chạy khi: app vào tiền cảnh · `expo-network` báo sóng trở lại · vừa gửi xong
  một việc.

### 5.3 Hỏng kiểu nào thì thử lại, kiểu nào thì thôi

| Nhận được | Xử |
|---|---|
| Không nối được, hết hạn chờ, 408, 429, 5xx | `failed_soft` → lùi dần, thử tiếp |
| 401 | đổi thẻ (mục 8) rồi thử **đúng một lần** nữa |
| 400, 403, 404, 409 | `failed_hard` → **dừng, và phải nói ra** |

> **Im lặng thử lại mãi là cách hỏng tệ nhất.** Người dùng tưởng đã gửi. Tên
> riêng vừa bị người khác lấy, hay mình đã bị người kia chặn — đó là `failed_hard`,
> và màn hình phải hiện ra.

Việc `failed_hard` **không tự xoá**. Ảnh chưa gửi là bản duy nhất trên đời; xoá
thay người dùng là mất vĩnh viễn. Xem mục 11 câu 3.

---

## 6 · Vòng đời một lần mở app

```
1. Mở SQLite (đồng bộ, ~ms)              ─┐
2. Đọc thẻ từ SecureStore                 │  KHÔNG có lệnh gọi mạng nào
3. Có thẻ dài hạn → phase = 'signed-in'   │  ở bốn bước này
4. Vẽ feed từ bảng `moment`              ─┘
   ↓ màn hình đã hiện, có ảnh, dùng được. Mất mạng thì DỪNG ở đây.
5. Chạy hàng đợi `outbox`
6. GET /v1/sync?cursor=… → áp từng dòng → feed tự cập nhật
7. Tải ngầm ảnh của khoảnh khắc mới
```

**Bước 3 là câu trả lời cho "offline vẫn vào được app".** Hiện `useAuth.phase`
khởi tạo thẳng là `'signed-out'`; phải đổi thành `'unknown'` rồi giải bằng
**đúng một phép đọc SecureStore**. Không được gọi `/v1/me` để "kiểm tra xem còn
đăng nhập không" — đó chính là thứ đẩy người dùng ra màn đăng nhập lúc đang ngồi
trên máy bay.

Đi kèm: **không màn nào được bắt đầu bằng vòng xoay chờ mạng.** Kho Zustand nhận
dữ liệu từ SQLite ngay lúc dựng; sync chỉ *đắp thêm*.

---

## 7 · Sáu cảnh mạng → ba nhóm, dò thế nào

[`03-offline.md`](03-offline.md) mục 1 liệt kê sáu cảnh. Về mã thì gom thành ba:

| Nhóm | Dấu hiệu trong code | Nói gì với người dùng |
|---|---|---|
| Máy không ra được internet | `fetch` ném lỗi, hoặc `AbortController` hết 10 giây | thanh mảnh "Đang chờ mạng" |
| Server không trả lời / trả 5xx | có phản hồi, `status >= 500` | "Chưa vào được, thử lại sau" |
| Server nói là hỏng | `ok: false`, có `code` | tra `code` ra chữ trong `@i18n` |

> **`expo-network` là GỢI Ý, không phải trọng tài.** Wi-Fi quán cà phê chưa đăng
> nhập vẫn báo "đã nối mạng" — thư viện nào cũng thế. Sự thật duy nhất là **lệnh
> gọi của chính mình có về hay không**. Dùng thư viện để *đánh thức* hàng đợi khi
> sóng trở lại; đừng dùng nó để quyết định có gọi hay không. Cứ gọi, hỏng thì xử.

Hạn chờ **10 giây** cho mọi lệnh gọi, bằng `AbortController`. Mạng một vạch đau
hơn mất hẳn chính là vì thiếu con số này: không có hạn chờ thì người dùng ngồi
nhìn vòng xoay thay vì thấy dữ liệu cũ.

---

## 8 · Thẻ hết hạn lúc offline — và ổ khoá một-lượt

Luật ở [`03-offline.md`](03-offline.md) mục 4.1; đây là hình dạng code
(`frontend/src/lib/net/authFetch.ts`):

```ts
let refreshing: Promise<boolean> | null = null;

function refreshOnce(): Promise<boolean> {
  // Hai chục lệnh cùng nhận 401 thì CHỈ MỘT lệnh xoay thẻ, số còn lại chờ kết
  // quả của nó. Không có ổ khoá này là hai chục lệnh cùng xoay, và cơ chế chống
  // chép thẻ ở server hiểu là thẻ bị đánh cắp rồi THU HỒI SẠCH PHIÊN.
  refreshing ??= doRefresh().finally(() => { refreshing = null; });
  return refreshing;
}
```

Ba luật đi kèm, mỗi cái ứng với một cách hỏng có thật:

1. **Không gọi được server → không kết luận gì.** Giữ nguyên trạng thái đăng
   nhập, cho xem hết dữ liệu ở máy, chỉ chặn việc buộc phải có server.
2. **Chỉ đăng xuất khi server nói rõ** `auth.session_revoked` / `auth.unauthorized`.
3. Ân hạn 30 giây ở server là **lưới an toàn cho mạng chập chờn**, không phải
   giấy phép bắn song song.

---

## 9 · Backend: đặt ở đâu, đổi gì

### Chỗ đứng của `sync`

`apis/app/sync/`, khai **tầng 4** trong `backend/scripts/check-arch.mjs`.

Tầng 4 nhập được tầng 0–3 nên đúng luật, nhưng luật thật nằm ở câu sau:

> `sync` **chỉ gọi `repository/`, không gọi service của tính năng khác.**

Vì `sync` không có một luật nghiệp vụ nào — nó chỉ đọc. Cho nó gọi
`MomentService`, `CircleService`… là biến nó thành module biết mọi thứ, và tới
lúc đó không tách ra được nữa. Mỗi kho tự có một hàm
`changesSince(userId, from, to, limit)`; `sync` trộn sáu kết quả rồi trả về. Đó
đúng là lối thoát số 2 mà `CLAUDE.md` đã khai sẵn: *"hạ câu truy vấn xuống
`repository/`"*.

### Việc phải làm, theo thứ tự cần

| # | Việc | Ghi chú |
|---|---|---|
| 1 | Mọi bảng của tính năng mới có `updated_at` **và chỉ mục** trên nó | migration viết tay |
| 2 | Mọi bảng đó `extends SoftDeleteEntity` | không có bia mộ thì sync không báo được xoá |
| 3 | `client_id` + `UNIQUE(author_id, client_id)` trên `moments`, `messages` | **cùng lúc với việc dựng bảng, không phải sau** |
| 4 | `GET /v1/sync` | mục 4 |
| 5 | Việc nền dọn bia mộ quá 30 ngày | BullMQ, tên trong `QUEUE.*` |
| 6 | Ký **một lượt nhiều đường ảnh** | vừa lên mạng mà bắn 40 lệnh lẻ thì chậm và tốn pin |
| 7 | `metadata.serverTime` | **đã có rồi** |
| 8 | Bản nhẹ `feed` / `thumb` | **đã có rồi** |
| 9 | Ân hạn 30 giây khi xoay thẻ | **đã có rồi** |

---

## 10 · Thứ tự làm

Không làm cả cụm một lúc, và cũng không nên — mỗi bước dưới đây tự nó chạy được
và tự nó kiểm được.

| Bước | Làm gì | Xong thì thấy gì |
|---|---|---|
| **1** | `authApi.ts` nối server thật + `authFetch` (hạn chờ, ổ khoá một-lượt, đọc vỏ câu trả lời) | đăng nhập bằng mã thật; rút mạng giữa chừng không bị đá ra |
| **2** | `src/lib/db/` — mở SQLite, dựng bảng, `meta` | `npm run check` sạch, chưa thấy gì |
| **3** | Boot đọc SecureStore → `phase` (mục 6, bước 1–4) | **bật chế độ máy bay vẫn vào được app** |
| **4** | BE: `moment` + `client_id` + soft delete, rồi `GET /v1/sync` | Swagger gọi được |
| **5** | FE: vòng đồng bộ, áp từng dòng, feed đọc SQLite | tắt app bật lại — feed hiện ngay, không vòng xoay |
| **6** | Kho ảnh theo `mediaId` (mục 2) | bật máy bay, feed **vẫn có ảnh** |
| **7** | `outbox` + chạy hàng đợi | chụp lúc mất mạng, có sóng thì tự gửi |
| **8** | Chữ và dấu hiệu: "Đang chờ mạng", "Sẽ tự gửi lại" | xem `03-offline.md` mục 5 |

Bước 3 rẻ nhất mà đổi cảm giác nhiều nhất. Bước 6 dễ bị bỏ qua nhất — và không
có nó thì "offline xem được" chỉ đúng với phần chữ.

---

## 11 · Bốn câu treo ở `03-offline.md` mục 7 — chốt

**1. Offline quá 48 giờ rồi mở app thì sao?** → **Cứ hiện.** 48 giờ là luật
**hiển thị**, không phải luật xoá: server giữ lại khoảnh khắc
([`01-product-system.md`](01-product-system.md) mục 9 câu 1 — vẫn đang là đề
xuất, nhưng nếu lật lại thì phải lật ở đó chứ không phải ở đây). Xoá ở máy cho
"đúng luật" là tự tạo một màn hình trống mà không có mạng để đắp lại. App tự dọn
dòng cũ hơn **7 ngày** — xa hơn 48 giờ đủ để hai luật không bao giờ va nhau.

**2. Trần dung lượng ảnh?** → **Không cần, và không làm ô cài đặt.** Đo ở mục 2:
~15MB. Trần 48 giờ đã làm hộ việc của trần dung lượng. Thêm một ô cài đặt là
thêm một thứ phải giải thích, cho một bài toán không tồn tại.

**3. Việc xếp hàng để bao lâu thì bỏ?** → **Không bao giờ tự bỏ.** Thử 24 giờ
không được thì **ngừng thử** và chuyển sang hỏi người dùng. Ảnh chưa gửi là bản
duy nhất trên đời — máy không được quyết thay.

**4. Bấm đăng xuất lúc không có mạng?** → **Xoá dữ liệu ở máy ngay**, xếp hàng
lệnh thu hồi thẻ cho lần sau có mạng. Cái điện thoại đang cầm trong tay quan
trọng hơn cái thẻ trên server. Lệnh thu hồi đó là thứ **duy nhất** sống sót qua
việc xoá kho.

---

## 12 · Ngày chuyển sang development build thì đổi gì

Không đổi gì trong thiết kế này. Chỉ thêm:

- `expo-background-task` → hàng đợi chạy cả khi app đã đóng.
- `react-native-mmkv` → thay ruột `src/lib/storage.ts`, **một file**. SQLite giữ nguyên.

Đó là điều đáng ghi lại: thiết kế này cố tình **không** đặt cược vào quyết định
dev build. Chốt sớm hay muộn đều không phải làm lại.
