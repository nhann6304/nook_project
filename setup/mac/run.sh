#!/usr/bin/env bash
#
# Chạy Nook trên máy dev — một lệnh, từ máy trắng cũng chạy được.
#
#   ./setup/mac/run.sh          bật cả server lẫn app
#   ./setup/mac/run.sh be       chỉ server
#   ./setup/mac/run.sh fe       chỉ app
#
# Lần đầu chạy nó sẽ tự: cài thư viện, dựng .env, kéo Postgres + Redis về, và
# chạy migration. Những lần sau nó bỏ qua mấy bước đã xong.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE="$ROOT/backend/docker/compose.dev.yml"
WHAT="${1:-all}"

BOLD=$'\033[1m'; DIM=$'\033[2m'; GREEN=$'\033[32m'; RED=$'\033[31m'; OFF=$'\033[0m'
say()  { printf '%s▸%s %s\n' "$BOLD" "$OFF" "$1"; }
ok()   { printf '%s  ✓%s %s\n' "$GREEN" "$OFF" "$1"; }
die()  { printf '%s  ✗%s %s\n' "$RED" "$OFF" "$1" >&2; exit 1; }
skip() { printf '%s  · %s%s\n' "$DIM" "$1" "$OFF"; }

cd "$ROOT"

# ── Kiểm những thứ phải có sẵn ──────────────────────────────────────────────
command -v node >/dev/null || die "Chưa có Node. Cài bản 22 hoặc 24 (đừng dùng bản lẻ như 23)."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" != "22" ] && [ "$NODE_MAJOR" != "24" ]; then
  printf '%s  ! Node v%s — mấy thư viện ở đây chỉ hứa chạy trên 22 hoặc 24.%s\n' "$DIM" "$NODE_MAJOR" "$OFF"
fi

if [ "$WHAT" != "fe" ]; then
  command -v docker >/dev/null || die "Chưa có Docker. Cần nó để chạy Postgres và Redis."
  docker info >/dev/null 2>&1 || die "Docker chưa bật. Mở Docker Desktop rồi chạy lại."
fi

# ── Thư viện ────────────────────────────────────────────────────────────────
say "Thư viện"
if [ ! -d node_modules ]; then npm install; ok "đã cài (server + gói dùng chung)"; else skip "server — đã có"; fi
if [ "$WHAT" != "be" ]; then
  if [ ! -d frontend/node_modules ]; then npm --prefix frontend install; ok "đã cài (app)"; else skip "app — đã có"; fi
fi

if [ "$WHAT" != "fe" ]; then
  # ── Biến môi trường ───────────────────────────────────────────────────────
  say "Biến môi trường"
  if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    ACCESS="$(node -e 'console.log(require("crypto").randomBytes(48).toString("base64url"))')"
    REFRESH="$(node -e 'console.log(require("crypto").randomBytes(48).toString("base64url"))')"
    # Dùng | làm dấu ngăn vì chuỗi base64url có thể chứa dấu /
    sed -i '' "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$ACCESS|"   backend/.env
    sed -i '' "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$REFRESH|" backend/.env
    ok "backend/.env dựng xong, hai chuỗi ký sinh ngẫu nhiên"
  else
    skip "backend/.env — đã có"
  fi

  # ── Redis ─────────────────────────────────────────────────────────────────
  say "Redis"
  docker compose -f "$COMPOSE" up -d >/dev/null
  ok "Redis 6380"

  # ── Postgres ──────────────────────────────────────────────────────────────
  say "Postgres"
  env_of() { grep -E "^$1=" backend/.env | head -1 | cut -d= -f2-; }
  DB_HOST="$(env_of DB_HOST)"; DB_PORT="$(env_of DB_PORT)"
  DB_USER="$(env_of DB_USER)"; DB_PASS="$(env_of DB_PASSWORD)"; DB_NAME="$(env_of DB_NAME)"

  # Cổng 5433 nghĩa là đang muốn dùng bản trong Docker — kéo nó lên hộ.
  if [ "$DB_PORT" = "5433" ]; then
    docker compose -f "$COMPOSE" --profile db up -d >/dev/null
  fi

  db_ok() { PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc 'SELECT 1' >/dev/null 2>&1; }

  if ! db_ok; then
    # Lần đầu trên một máy đã có Postgres: thiếu vai và kho, dựng hộ luôn.
    if command -v psql >/dev/null && command -v createdb >/dev/null; then
      psql -h "$DB_HOST" -p "$DB_PORT" -d postgres -v ON_ERROR_STOP=1 >/dev/null 2>&1 <<SQL || true
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';
  END IF;
END \$\$;
SQL
      createdb -h "$DB_HOST" -p "$DB_PORT" -O "$DB_USER" "$DB_NAME" >/dev/null 2>&1 || true
    fi
  fi

  for _ in $(seq 1 30); do db_ok && break; sleep 1; done
  db_ok || die "Không nối được Postgres ở $DB_HOST:$DB_PORT.
     Bản trên máy chưa chạy?   brew services start postgresql@15
     Muốn dùng bản Docker?     docker compose -f $COMPOSE --profile db up -d
                               rồi đổi DB_PORT trong backend/.env thành 5433"
  ok "Postgres $DB_HOST:$DB_PORT/$DB_NAME"

  # ── Bảng ──────────────────────────────────────────────────────────────────
  say "Bảng"
  npm run migration:run --silent >/dev/null && ok "migration đã chạy tới bản mới nhất"
fi

# ── Chạy ────────────────────────────────────────────────────────────────────
BE_PID=""
cleanup() { [ -n "$BE_PID" ] && kill "$BE_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

case "$WHAT" in
  be)
    say "Server — http://localhost:4000/docs"
    exec npm run dev:be
    ;;
  fe)
    say "App — quét mã QR bằng Expo Go"
    exec npm run dev:fe
    ;;
  all)
    say "Server — http://localhost:4000/docs"
    npm run dev:be & BE_PID=$!
    sleep 2
    say "App — quét mã QR bằng Expo Go"
    say "Ctrl+C một lần là tắt cả hai."
    npm run dev:fe
    ;;
  *)
    die "Không hiểu '$WHAT'. Dùng: run.sh [all|be|fe]"
    ;;
esac
