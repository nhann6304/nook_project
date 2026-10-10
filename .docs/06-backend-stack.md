# Bộ máy backend — chọn gì, vì sao, lớn lên thì thêm gì

Tài liệu chung: app không gọi thẳng thứ nào ở đây, nhưng ai làm app cũng cần
biết server đứng trên cái gì và giới hạn nằm ở đâu. Chi tiết từng phần ở
[`backend/README.md`](../backend/README.md).

## 1. Đang dùng

| Thành phần | Bản | Vì sao chọn |
|---|---|---|
| **NestJS trên Fastify** | Nest 12 · Fastify 5 | Khung có module/DI rõ ràng cho đội nhiều người; Fastify nhanh gấp đôi Express ở cùng phần cứng |
| **PostgreSQL** | 16 | Nguồn thật duy nhất. Ràng buộc (UNIQUE, CHECK, trigger) chặn lỗi ở tầng dữ liệu, không chỉ ở mã |
| **PgBouncer** | 1.24 (`transaction`) | N bản api × 10 kết nối chạm trần `max_connections` rất nhanh; PgBouncer gom về ~20 kết nối thật |
| **Redis** | 7 (`noeviction`) | Mã đăng nhập, trần chống bot, cầu socket, đếm online, hàng đợi — MỘT Redis, nên không được đuổi khoá |
| **BullMQ** | 6 | Việc nền thử lại được (bản nhẹ của ảnh, chép sang chỉ mục tìm kiếm); nhiều bản api không chạy trùng việc |
| **socket.io + redis-adapter** | 4.8 | Tin nhắn tức thời; bản api này bắn được tới người đang nối vào bản api kia |
| **Elasticsearch** | 8.19 (một nút) | Tìm người theo tên, bỏ dấu tiếng Việt ("duc" ra "Đức"), gõ dở vẫn ra. Chỉ là BẢN SAO — tắt hay hỏng thì lùi về Postgres |
| **S3 (MinIO / Cloudflare R2)** | — | Ảnh đi thẳng từ điện thoại lên kho bằng đường ký, không qua server. R2 không tính tiền băng thông ra |
| **prom-client** | 15.1 | `/metrics` cho Prometheus: thời gian từng đường, bộ nhớ, event loop. Chỉ mở trong mạng của cụm |
| **Log: `ConsoleLogger` của Nest** | — | Bản thật in JSON (`json: true`). **pino đã thử rồi bỏ** — lý do ở `backend/src/config/logger/logger.factory.ts` |
| **SMS: eSMS / Twilio** | REST, không SDK | Mã đăng nhập qua số di động VN. Chọn bằng `SMS_SENDER` |

Không dùng, có chủ ý: Kafka (BullMQ + Redis đủ tới hàng triệu việc/ngày),
Kubernetes (compose + `--scale` đủ cho một máy lớn), quan hệ ORM (mục 3 README).

## 2. Lớn lên thì thêm gì — theo số người dùng

Số liệu là mốc để BẮT ĐẦU NHÌN, không phải luật. Đo `/metrics` trước khi thêm.

| Mốc (người dùng hoạt động/ngày) | Thêm | Dấu hiệu cần |
|---|---|---|
| ~10 nghìn | Hiện tại đủ: một máy, `--scale api=2..4`, PgBouncer | — |
| ~50 nghìn | **CDN trước kho ảnh** (tên miền riêng cho R2) | băng thông ảnh, ảnh tải chậm ở xa |
| ~50 nghìn | **Dịch vụ đẩy** (Expo Push / FCM / APNs) qua hàng đợi `push` | có thông báo thật |
| ~100 nghìn | **Bản đọc Postgres** (read replica) cho đường chỉ đọc nặng | CPU Postgres > 60% phần lớn thời gian |
| ~100 nghìn | Tách **Redis thứ hai** cho bộ đệm (`allkeys-lru`); Redis cũ giữ hàng đợi (`noeviction`) | Redis gần `maxmemory` |
| ~500 nghìn | **Cụm Elasticsearch** 3 nút, `number_of_replicas: 1` | tìm kiếm p95 > 200 ms, hoặc cần không chết khi một nút chết |
| ~1 triệu | **Redis Cluster** / Sentinel; tách worker BullMQ khỏi api | một Redis không gánh nổi, hoặc việc nền làm chậm request |
| xa hơn | Chia bảng tin nhắn theo thời gian (partition), CDN cho cả API đọc | bảng `chat_messages` hàng tỉ dòng |

## 3. Chạy và dựng

```bash
# Máy dev — server chạy thẳng trên máy, dịch vụ trong Docker
docker compose -f backend/docker/compose.dev.yml up -d                     # Redis + MinIO
docker compose -f backend/docker/compose.dev.yml --profile search up -d    # + Elasticsearch
./setup/mac/run.sh be

# Dựng image api (bối cảnh là GỐC kho)
npm run docker:build                                  # -> nook-api:local
# sau proxy công ty mở TLS: thêm --secret id=npm_ca,src=<ca.pem> --build-arg HTTPS_PROXY=...

# Cả cụm: db · pgbouncer · redis · elasticsearch · minio · migrate · api · nginx
cp backend/docker/.env.example backend/docker/.env    # rồi điền bí mật
npm run stack:up
docker compose -f backend/docker/compose.yml up -d --scale api=3

# Dựng lại chỉ mục tìm kiếm từ Postgres
docker compose -f backend/docker/compose.yml exec api node backend/dist/cli/search-reindex.js
```

Image: Node 22 bookworm-slim, hai chặng, chạy bằng người dùng `node`, có
`HEALTHCHECK`, `node` nhận SIGTERM trực tiếp và đóng gọn (compose đặt thêm
`init: true`). Migration chạy MỘT lần bằng dịch vụ `migrate`, đi thẳng vào
Postgres, không qua PgBouncer.

Elasticsearch ở máy Linux thật cần `vm.max_map_count=262144`
(`sysctl -w vm.max_map_count=262144`). Ổ đĩa đầy quá 90% thì ES không đặt chỉ
mục mới — tìm kiếm lùi về Postgres, nhưng hãy dọn đĩa.
