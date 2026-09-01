#!/usr/bin/env bash
#
# Chạy Nook.
#
#   ./setup/mac/run.sh          bật cả server lẫn app
#   ./setup/mac/run.sh be       chỉ server
#   ./setup/mac/run.sh fe       chỉ app
#
# Máy chưa cài thì nó tự gọi install.sh — nên vẫn dùng được từ máy trắng.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"
cd "$ROOT"
WHAT="${1:-all}"

need_node

if ! installed; then
  say "Chưa cài — chạy install trước"
  "$ROOT/setup/mac/install.sh" "$WHAT"
  echo
fi

# ── Thứ server dựa vào ──────────────────────────────────────────────────────
if [ "$WHAT" != "fe" ]; then
  need_docker
  docker compose -f "$COMPOSE" up -d >/dev/null
  [ "$(env_of DB_PORT)" = "5433" ] && docker compose -f "$COMPOSE" --profile db up -d >/dev/null
  for _ in $(seq 1 20); do db_ok && break; sleep 1; done
  db_ok || die "Không nối được Postgres. Chạy: ./setup/mac/install.sh"
  ok "Redis 6380 · Postgres $(env_of DB_HOST):$(env_of DB_PORT)/$(env_of DB_NAME)"
fi

# ── Chạy ────────────────────────────────────────────────────────────────────
BE_PID=""
cleanup() { [ -n "$BE_PID" ] && kill "$BE_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

# Log server ghi ra màn hình VÀ ra tệp. Ra tệp để `scripts/smoke-auth.sh` đọc
# được mã 6 số — khi dev thì mã chỉ đi ra log, không gửi đi đâu cả.
BE_LOG="$ROOT/backend/.logs/server.log"
mkdir -p "$(dirname "$BE_LOG")"

case "$WHAT" in
  be)
    say "Server — http://localhost:4000/docs"
    skip "log ghi thêm vào $BE_LOG"
    npm run dev:be 2>&1 | tee "$BE_LOG"
    ;;
  fe) say "App — quét mã QR bằng Expo Go"; exec npm run dev:fe ;;
  all)
    say "Server — http://localhost:4000/docs"
    npm run dev:be > "$BE_LOG" 2>&1 & BE_PID=$!
    sleep 2
    say "App — quét mã QR bằng Expo Go"
    say "Ctrl+C một lần là tắt cả hai. Log server ở $BE_LOG"
    npm run dev:fe
    ;;
  *) die "Không hiểu '$WHAT'. Dùng: run.sh [all|be|fe]" ;;
esac
