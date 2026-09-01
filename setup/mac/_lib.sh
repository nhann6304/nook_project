#!/usr/bin/env bash
#
# Mấy hàm dùng chung cho install.sh và run.sh. Không chạy trực tiếp tệp này.
#
# Có nó để install và run KHÔNG lệch nhau: cùng một cách đọc .env, cùng một
# cách dò cơ sở dữ liệu. Chép đôi hai đoạn đó là chuẩn bị sẵn một ngày chúng nó
# nói hai điều khác nhau.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE="$ROOT/backend/docker/compose.dev.yml"

BOLD=$'\033[1m'; DIM=$'\033[2m'; GREEN=$'\033[32m'; RED=$'\033[31m'; YEL=$'\033[33m'; OFF=$'\033[0m'
say()  { printf '%s▸%s %s\n' "$BOLD" "$OFF" "$1"; }
ok()   { printf '%s  ✓%s %s\n' "$GREEN" "$OFF" "$1"; }
warn() { printf '%s  ! %s%s\n' "$YEL" "$1" "$OFF"; }
skip() { printf '%s  · %s%s\n' "$DIM" "$1" "$OFF"; }
die()  { printf '%s  ✗%s %s\n' "$RED" "$OFF" "$1" >&2; exit 1; }

env_of() { grep -E "^$1=" "$ROOT/backend/.env" | head -1 | cut -d= -f2-; }

db_ok() {
  PGPASSWORD="$(env_of DB_PASSWORD)" psql \
    -h "$(env_of DB_HOST)" -p "$(env_of DB_PORT)" \
    -U "$(env_of DB_USER)" -d "$(env_of DB_NAME)" -tAc 'SELECT 1' >/dev/null 2>&1
}

need_node() {
  command -v node >/dev/null || die "Chưa có Node. Cài bản 22 hoặc 24 (đừng dùng bản lẻ như 23)."
  local major; major="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$major" != "22" ] && [ "$major" != "24" ]; then
    warn "Node v$major — mấy thư viện ở đây chỉ hứa chạy trên 22 hoặc 24."
  fi
}

need_docker() {
  command -v docker >/dev/null || die "Chưa có Docker. Cần nó để chạy Redis."
  docker info >/dev/null 2>&1 || die "Docker chưa bật. Mở Docker Desktop rồi chạy lại."
}

installed() { [ -d "$ROOT/node_modules" ] && [ -f "$ROOT/backend/.env" ]; }
