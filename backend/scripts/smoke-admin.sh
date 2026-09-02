#!/usr/bin/env bash
#
# Chạy thử đường quản trị trên server ĐANG chạy.
#
#   ./setup/mac/run.sh be              # cửa sổ 1
#   ./backend/scripts/smoke-admin.sh   # cửa sổ 2
set -uo pipefail
BASE="${BASE:-http://localhost:4000}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGFILE="${NOOK_LOG:-$ROOT/.logs/server.log}"
GREEN=$'\033[32m'; RED=$'\033[31m'; BOLD=$'\033[1m'; DIM=$'\033[2m'; OFF=$'\033[0m'

PASS=0; FAIL=0
check() { if [ "$2" = "$3" ]; then PASS=$((PASS+1)); printf '%s  ✓%s %s\n' "$GREEN" "$OFF" "$1"
          else FAIL=$((FAIL+1)); printf '%s  ✗%s %s %s(mong %s, nhận %s)%s\n' "$RED" "$OFF" "$1" "$DIM" "$2" "$3" "$OFF"; fi; }
code_of() { python3 -c "import sys,json;print(json.load(sys.stdin).get('code',''))" 2>/dev/null; }
field()   { python3 -c "import sys,json;print(json.load(sys.stdin)['data']$1)" 2>/dev/null; }
read_code() { grep -o 'code: [0-9]\{6\}' "$LOGFILE" 2>/dev/null | tail -1 | awk '{print $2}'; }

login() { # login <email>  -> in ra thẻ ngắn hạn
  curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' \
       -d "{\"method\":\"email\",\"target\":\"$1\"}" >/dev/null
  sleep 0.4
  curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
       -d "{\"method\":\"email\",\"target\":\"$1\",\"code\":\"$(read_code)\"}" | field "['accessToken']"
}

curl -sf "$BASE/health" >/dev/null || { echo "${RED}Server chưa chạy ở $BASE${OFF}"; exit 1; }

ROOT_MAIL="$(PGPASSWORD=nook psql -h localhost -p 5432 -U nook -d nook -tA -c \
  "SELECT i.value FROM users u JOIN user_identities i ON i.user_id=u.id WHERE u.role='root' LIMIT 1" 2>/dev/null | tr -d '[:space:]')"
printf '%s▸%s Tài khoản gốc: %s\n' "$BOLD" "$OFF" "${ROOT_MAIL:-(không thấy)}"

# ── người thường không được vào ─────────────────────────────────────────────
MEMBER="member$RANDOM@nook.test"
A_MEMBER="$(login "$MEMBER")"
[ -n "$A_MEMBER" ] || { echo "${RED}không đăng nhập được người thường${OFF}"; exit 1; }
check "người thường bị chặn ở /v1/admin/stats" "auth.forbidden" \
      "$(curl -s "$BASE/v1/admin/stats" -H "authorization: Bearer $A_MEMBER" | code_of)"
check "người thường bị chặn ở /v1/admin/users" "auth.forbidden" \
      "$(curl -s "$BASE/v1/admin/users" -H "authorization: Bearer $A_MEMBER" | code_of)"
check "không thẻ thì là 401 chứ không phải 403" "auth.unauthorized" \
      "$(curl -s "$BASE/v1/admin/stats" | code_of)"
check "vai của người thường" "member" "$(curl -s "$BASE/v1/me" -H "authorization: Bearer $A_MEMBER" | field "['role']")"

# ── tài khoản gốc thì vào được ──────────────────────────────────────────────
A_ROOT="$(login "$ROOT_MAIL")"
[ -n "$A_ROOT" ] || { echo "${RED}không đăng nhập được tài khoản gốc${OFF}"; exit 1; }
check "vai của tài khoản gốc" "root" "$(curl -s "$BASE/v1/me" -H "authorization: Bearer $A_ROOT" | field "['role']")"
STATS="$(curl -s "$BASE/v1/admin/stats" -H "authorization: Bearer $A_ROOT")"
check "gốc xem được số liệu" "ok" "$(echo "$STATS" | code_of)"
printf '%s     %s%s\n' "$DIM" "$(echo "$STATS" | python3 -c "import sys,json;d=json.load(sys.stdin)['data'];print(' · '.join(f'{k}={v}' for k,v in d.items()))" 2>/dev/null)" "$OFF"

USERS="$(curl -s "$BASE/v1/admin/users?limit=2" -H "authorization: Bearer $A_ROOT")"
check "gốc xem được danh sách người dùng" "ok" "$(echo "$USERS" | code_of)"
N="$(echo "$USERS" | python3 -c "import sys,json;print(len(json.load(sys.stdin)['data']['items']))" 2>/dev/null)"
check "lật trang: xin 2 thì nhận 2" "2" "$N"
# Luật sản phẩm không có ngoại lệ cho quản trị: trang này được biết hệ thống
# chạy ra sao, KHÔNG được biết ai thân với ai.
LEAK="$(echo "$USERS" | python3 -c "
import sys, json
raw = sys.stdin.read().lower()
print(','.join(w for w in ('level','friendship','memory','circle') if w in raw) or 'khong')" 2>/dev/null)"
check "danh sách quản trị không lộ chuyện riêng" "khong" "$LEAK"

echo
if [ "$FAIL" -eq 0 ]; then printf '%s%sĐẠT — %d/%d%s\n' "$BOLD" "$GREEN" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 0
else printf '%s%sHỎNG — %d/%d%s\n' "$BOLD" "$RED" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 1; fi
