# Bối cảnh build là GỐC KHO, không phải thư mục backend — vì backend cần
# `shared/` nằm cạnh nó:
#   npm run docker:build   (= docker build -f backend/Dockerfile -t nook-api:local .)
# Tệp bỏ qua là `backend/Dockerfile.dockerignore` (cạnh tệp này), không phải
# `backend/.dockerignore`.
#
# Cả cụm (Postgres, Redis, MinIO, migration, API, proxy): backend/docker/compose.yml

# ── Chặng dựng ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Không apt, không bộ biên dịch: argon2 và sharp đều có bản dựng sẵn cho
# linux-x64/arm64 glibc. Bookworm chứ không Alpine — musl thì không có bản sẵn.

# Chép trước phần khai báo gói để tầng cache còn dùng lại được.
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
# `--mount=type=cache`: tải lại gói chỉ khi lockfile đổi.
# Sau proxy công ty (TLS bị mở ra soi): `--build-arg HTTPS_PROXY=...` và
# `--secret id=npm_ca,src=<ca.pem>`. Cả hai KHÔNG nằm lại trong image; không
# truyền thì bỏ qua.
RUN --mount=type=cache,target=/root/.npm --mount=type=secret,id=npm_ca \
    if [ -s /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci --no-audit --no-fund

COPY shared shared
COPY backend backend
RUN npm run build -w @nook/shared \
 && npm run build -w @nook/backend

# Vứt phần chỉ dùng lúc dựng.
RUN npm prune --omit=dev

# ── Chặng chạy ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules      ./node_modules
COPY --from=build /app/package.json      ./package.json
COPY --from=build /app/shared/dist       ./shared/dist
COPY --from=build /app/shared/package.json ./shared/package.json
COPY --from=build /app/backend/dist      ./backend/dist
COPY --from=build /app/backend/package.json ./backend/package.json

# Migration chạy bằng CHÍNH image này — migration đã dịch nằm trong
# `backend/dist/database/migration/`, `typeorm` là phụ thuộc chạy nên còn sau
# `npm prune`. Dịch vụ `migrate` của compose gọi đúng lệnh này:
#   node node_modules/typeorm/cli.js -d backend/dist/database/data-source/data-source.js migration:run

USER node
EXPOSE 4000

# Đọc `data.ok` chứ không chỉ mã 200 — /health trả 200 cả khi Postgres hỏng.
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=6 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4000/health').then(r=>r.json()).then(j=>process.exit(j.data&&j.data.ok?0:1)).catch(()=>process.exit(1))"]

# Dạng mảng: node là PID 1 và tự nhận SIGTERM (`enableShutdownHooks` đóng
# Fastify, Postgres, Redis, worker BullMQ). Chạy tay thì thêm `--init` (tini có
# sẵn trong Docker); compose đã đặt `init: true`.
STOPSIGNAL SIGTERM
CMD ["node", "backend/dist/main.js"]
