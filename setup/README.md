# setup — hai việc, hai máy

Chỉ có hai việc ở đây, mỗi việc một bản cho macOS và một bản cho Windows.

| Việc | macOS | Windows |
|---|---|---|
| Chạy cả server lẫn app | `./setup/mac/run.sh` | `setup\win\run.bat` |
| Kiểm rồi đẩy mã lên | `./setup/mac/push.sh "lời nhắn"` | `setup\win\push.bat "loi nhan"` |

## `run` — một lệnh, từ máy trắng cũng chạy

```bash
./setup/mac/run.sh        # cả hai
./setup/mac/run.sh be     # chỉ server
./setup/mac/run.sh fe     # chỉ app
```

Lần đầu nó tự làm hết: cài thư viện, dựng `backend/.env` (kèm hai chuỗi ký
sinh ngẫu nhiên), kéo Postgres + Redis về, chờ cơ sở dữ liệu mở cửa, chạy
migration. Những lần sau nó bỏ qua mấy bước đã xong — nên cứ chạy đúng một lệnh
đó, mọi lúc.

**Không có bước "cài lần đầu" riêng.** Có một script mà người ta chỉ chạy đúng
một lần trong đời là có một script không ai nhớ tên.

Xong thì:

- Server: <http://localhost:4000> — Swagger ở `/docs`
- App: quét mã QR bằng Expo Go

Cần gì sẵn trên máy: **Node 22 hoặc 24** (đừng dùng bản lẻ như 23 — vài thư
viện không hứa chạy trên đó) và **Docker Desktop** đang bật.

## `push` — kiểm trước, đẩy sau

```bash
./setup/mac/push.sh "sửa màn đăng nhập"
```

Theo thứ tự: soi xem có file `.env` nào lọt vào không → dịch gói dùng chung →
dịch và lint server → dịch và lint app → hỏi lại nếu đang đứng thẳng trên
`main` → `add` + `commit` + `push`.

Hỏng ở bất kỳ bước nào là **dừng, không đẩy**. Đẩy một bản hỏng lên nhánh chung
là làm mất buổi sáng của người kéo về sau.

## Cổng, và vì sao chúng lệch chuẩn

| Thứ | Ở đâu | Cổng | Vì sao |
|---|---|---|---|
| Server | trên máy | 4000 | 3000 đã có thứ khác |
| Postgres | **trên máy** (Homebrew) | 5432 | dùng bản có sẵn thì `psql` gõ thẳng được, và dữ liệu không bay khi ai đó lỡ `down -v` |
| Redis | Docker | **6380** | 6379 đã có Redis của dự án khác |
| MinIO | Docker | 9000 / 9001 | chưa bật — xem dưới |

Kho tên `nook`, vai `nook`. Lần đầu chạy `run.sh` nó tự dựng nếu chưa có.

Máy không có Postgres sẵn (Windows chẳng hạn) thì dùng bản trong Docker:

```bash
docker compose -f backend/docker/compose.dev.yml --profile db up -d
# rồi đổi DB_PORT trong backend/.env thành 5433
```

Đổi cổng thì đổi ở `backend/docker/compose.dev.yml` **và** `backend/.env`, hai
chỗ phải khớp.

## Vài lệnh hay cần

```bash
npm run up          # chỉ bật Postgres + Redis
npm run down        # tắt
npm run logs        # xem log của cụm
npm run reset:db    # XOÁ SẠCH dữ liệu rồi dựng lại — không hỏi lại lần hai
npm run check       # dịch + lint phía server
npm run migration:run

# Kho ảnh giả lập, chưa dùng ở chặng này:
docker compose -f backend/docker/compose.dev.yml --profile media up -d
```
