# setup — ba việc, hai hệ điều hành

| Việc | macOS | Windows |
|---|---|---|
| Cài đặt | `./setup/mac/install.sh` | `setup\win\install.bat` |
| Chạy server + app | `./setup/mac/run.sh` | `setup\win\run.bat` |
| Kiểm rồi đẩy mã lên | `./setup/mac/push.sh "lời nhắn"` | `setup\win\push.bat "loi nhan"` |

Cả ba nhận thêm `be` hoặc `fe` để chỉ làm một bên: `./setup/mac/run.sh be`.

Máy cần sẵn: **Node 22 hoặc 24** (đừng dùng bản lẻ như 23 — vài thư viện không
hứa chạy trên đó) và **Docker Desktop** đang bật.

## `install` — chạy được nhiều lần

```bash
./setup/mac/install.sh
```

Cài thư viện → dựng `backend/.env` kèm hai chuỗi ký sinh ngẫu nhiên → kéo Redis
lên → dò (và dựng hộ nếu thiếu) vai và kho Postgres → dịch `@nook/shared` →
chạy migration.

**Chạy lại sau mỗi lần `git pull` là an toàn.** Bước nào xong rồi thì bỏ qua,
chỉ làm phần còn thiếu — thư viện mới, migration mới đều vào đúng chỗ. Nó không
đụng vào `backend/.env` đã có, nên chuỗi ký của bạn không bị ghi đè.

## `run` — bật lên

```bash
./setup/mac/run.sh        # cả hai
./setup/mac/run.sh be     # chỉ server
./setup/mac/run.sh fe     # chỉ app
```

Máy chưa cài thì nó **tự gọi `install`**, nên từ máy trắng vẫn chỉ cần một lệnh.
Đã cài rồi thì nó chỉ dựng lại mấy thứ server dựa vào (Redis, dò Postgres) rồi
bật — nhanh, không cài lại gì.

Xong thì:

- Server: <http://localhost:4000> — Swagger ở `/docs`
- App: quét mã QR bằng Expo Go

Server ghi log **ra màn hình và ra `backend/.logs/server.log`**. Tệp đó là chỗ
`backend/scripts/smoke-auth.sh` đọc mã 6 số — khi dev thì mã chỉ đi ra log, không
gửi đi đâu cả.

## `push` — kiểm trước, đẩy sau

```bash
./setup/mac/push.sh "sửa màn đăng nhập"
```

Theo thứ tự: soi xem có tệp `.env` nào lọt vào không → dịch gói dùng chung →
dịch và lint server → dịch và lint app → hỏi lại nếu đang đứng thẳng trên
`main` → `add` + `commit` + `push`.

Hỏng ở bất kỳ bước nào là **dừng, không đẩy**. Đẩy một bản hỏng lên nhánh chung
là làm mất buổi sáng của người kéo về sau.

## Chạy thử luồng đăng nhập

```bash
./setup/mac/run.sh be            # cửa sổ 1
./backend/scripts/smoke-auth.sh  # cửa sổ 2
```

15 bước, kết bằng một dòng ĐẠT/HỎNG. Chạy sau mỗi lần đụng vào phần đăng nhập.

## Windows: chữ tiếng Việt ra thành rác

Mấy tệp `.bat` mở đầu bằng `chcp 65001` để cửa sổ chạy bảng mã UTF-8. Không có
dòng đó thì chữ có dấu của server hiện thành ký tự lạ.

Vì `cmd` đọc chính tệp `.bat` theo bảng mã đang dùng, chữ **trong** mấy tệp đó
cố ý để không dấu — đổi bảng mã giữa chừng rồi để chữ có dấu phía dưới là một
cách làm hỏng chính tệp đó trên vài bản Windows. Log của server thì đã là tiếng
Anh nên không dính chuyện này.

## `_lib.sh`

Hàm dùng chung của `install` và `run`: đọc `.env`, dò cơ sở dữ liệu, kiểm Node
và Docker. Có nó để hai script **không lệch nhau** — chép đôi mấy đoạn đó là
chuẩn bị sẵn một ngày chúng nó nói hai điều khác nhau. Không chạy trực tiếp.

## Cổng, và vì sao chúng lệch chuẩn

| Thứ | Ở đâu | Cổng | Vì sao |
|---|---|---|---|
| Server | trên máy | 4000 | 3000 đã có thứ khác |
| Postgres | **trên máy** (Homebrew) | 5432 | dùng bản có sẵn thì `psql` gõ thẳng được, và dữ liệu không bay khi ai đó lỡ `down -v` |
| Redis | Docker | **6380** | 6379 đã có Redis của dự án khác |
| MinIO | Docker | 9000 / 9001 | chưa bật — xem dưới |

Kho tên `nook`, vai `nook`. `install` tự dựng nếu chưa có.

**Máy không có Postgres cài sẵn** (Windows chẳng hạn): đổi đúng một dòng trong
`backend/.env` thành `DB_PORT=5433`. Script thấy 5433 là tự kéo container
Postgres lên, không phải gõ thêm lệnh nào.

## Vài lệnh hay cần

```bash
npm run up          # chỉ bật Redis
npm run down        # tắt
npm run logs        # xem log của cụm
npm run reset:db    # XOÁ SẠCH dữ liệu Docker rồi dựng lại — không hỏi lại lần hai
npm run check       # dịch + lint phía server
npm run migration:run

# Kho ảnh giả lập, chưa dùng ở chặng này:
docker compose -f backend/docker/compose.dev.yml --profile media up -d
```
