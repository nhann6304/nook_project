#!/usr/bin/env bash
#
# Cài đặt Nook — chạy được nhiều lần, không phải chỉ một lần trong đời.
#
#   ./setup/mac/install.sh          cài hết
#   ./setup/mac/install.sh be       chỉ phần server
#   ./setup/mac/install.sh fe       chỉ phần app
#
# Chạy lại sau mỗi lần `git pull` là an toàn: bước nào xong rồi nó bỏ qua, chỉ
# làm phần còn thiếu. Thư viện mới, migration mới đều vào đúng chỗ.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"
cd "$ROOT"
WHAT="${1:-all}"

need_node
[ "$WHAT" = "fe" ] || need_docker

# ── Thư viện ────────────────────────────────────────────────────────────────
say "Thư viện"
if [ ! -d node_modules ]; then
  npm install
  ok "server + gói dùng chung"
else
  npm install --silent
  skip "server — đã có (đã soát lại)"
fi

if [ "$WHAT" != "be" ]; then
  if [ ! -d frontend/node_modules ]; then
    npm --prefix frontend install
    ok "app"
  else
    skip "app — đã có"
  fi
fi

[ "$WHAT" != "fe" ] || { say "Xong"; ok "chạy: ./setup/mac/run.sh fe"; exit 0; }

# ── Biến môi trường ─────────────────────────────────────────────────────────
say "Biến môi trường"
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  ACCESS="$(node -e 'console.log(require("crypto").randomBytes(48).toString("base64url"))')"
  REFRESH="$(node -e 'console.log(require("crypto").randomBytes(48).toString("base64url"))')"
  # Dấu ngăn là | vì chuỗi base64url có thể chứa dấu /
  sed -i '' "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$ACCESS|"   backend/.env
  sed -i '' "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$REFRESH|" backend/.env
  ok "backend/.env — hai chuỗi ký sinh ngẫu nhiên, không dùng chuỗi dev trong .env.example"
else
  skip "backend/.env — đã có, không đụng vào"
fi

# ── Redis ───────────────────────────────────────────────────────────────────
say "Redis"
docker compose -f "$COMPOSE" up -d >/dev/null
ok "cổng 6380"

# ── Postgres ────────────────────────────────────────────────────────────────
say "Postgres"
DB_HOST="$(env_of DB_HOST)"; DB_PORT="$(env_of DB_PORT)"
DB_USER="$(env_of DB_USER)"; DB_PASS="$(env_of DB_PASSWORD)"; DB_NAME="$(env_of DB_NAME)"

# Cổng 5433 nghĩa là đang muốn dùng bản trong Docker — kéo nó lên hộ.
if [ "$DB_PORT" = "5433" ]; then
  docker compose -f "$COMPOSE" --profile db up -d >/dev/null
fi

if ! db_ok; then
  # Máy đã có Postgres nhưng chưa có vai và kho — dựng hộ.
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
     Máy không có Postgres?    docker compose -f $COMPOSE --profile db up -d
                               rồi đổi DB_PORT trong backend/.env thành 5433"
ok "$DB_HOST:$DB_PORT/$DB_NAME"

# ── Gói dùng chung + bảng ───────────────────────────────────────────────────
say "Gói dùng chung"
npm run build:shared --silent >/dev/null
ok "@nook/shared đã dịch"

say "Bảng"
npm run migration:run --silent >/dev/null
ok "migration đã chạy tới bản mới nhất"

say "Xong"
ok "chạy: ./setup/mac/run.sh"
