# Bối cảnh build là GỐC KHO, không phải thư mục backend — vì backend cần
# `shared/` nằm cạnh nó:
#   docker build -f backend/Dockerfile -t nook-backend .

# ── Chặng dựng ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS build
WORKDIR /app

# argon2 có phần biên dịch bằng C, cần bộ công cụ. Bookworm chứ không Alpine:
# musl + argon2 là một buổi tối mất công không cần thiết.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# Chép trước phần khai báo gói để tầng cache còn dùng lại được.
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
RUN npm ci

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

USER node
EXPOSE 4000
CMD ["node", "backend/dist/main.js"]
