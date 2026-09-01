#!/usr/bin/env bash
#
# Chạy thử toàn bộ luồng đăng nhập trên server ĐANG chạy.
#
#   ./setup/mac/run.sh be        # cửa sổ 1
#   ./backend/scripts/smoke-auth.sh   # cửa sổ 2
#
# Nó tự đọc mã 6 số từ log server (CODE_SENDER=console), nên chỉ chạy được ở
# máy dev. Kết thúc bằng một dòng ĐẠT / HỎNG.
set -uo pipefail

BASE="${BASE:-http://localhost:4000}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GREEN=$'\033[32m'; RED=$'\033[31m'; DIM=$'\033[2m'; BOLD=$'\033[1m'; OFF=$'\033[0m'

PASS=0; FAIL=0
check() { # check "tên" "mong đợi" "nhận được"
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); printf '%s  ✓%s %s\n' "$GREEN" "$OFF" "$1"
  else FAIL=$((FAIL+1)); printf '%s  ✗%s %s %s(mong %s, nhận %s)%s\n' "$RED" "$OFF" "$1" "$DIM" "$2" "$3" "$OFF"; fi
}
code_of() { python3 -c "import sys,json;print(json.load(sys.stdin).get('code',''))" 2>/dev/null; }
field()   { python3 -c "import sys,json;d=json.load(sys.stdin);print(d['data']$1)" 2>/dev/null; }

curl -sf "$BASE/health" >/dev/null || { echo "${RED}Server chưa chạy ở $BASE${OFF}"; exit 1; }

# Mã 6 số chỉ đi ra log server (CODE_SENDER=console). `run.sh` ghi log ra tệp
# dưới đây; máy nào để log chỗ khác thì đặt NOOK_LOG=<đường dẫn>.
LOGFILE="${NOOK_LOG:-$ROOT/backend/.logs/server.log}"
read_code() { grep -o 'code: [0-9]\{6\}' "$LOGFILE" 2>/dev/null | tail -1 | awk '{print $2}'; }

MAIL="smoke$RANDOM@nook.test"
printf '%s▸%s Đích thử: %s\n' "$BOLD" "$OFF" "$MAIL"

# ── 1. Xin mã ───────────────────────────────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' \
      -d "{\"method\":\"email\",\"target\":\"$MAIL\"}")
check "xin mã" "auth.code_sent" "$(echo "$R" | code_of)"

CODE="$(read_code)"
if [ -z "$CODE" ]; then
  printf '%s  ✗%s không đọc được mã trong %s\n' "$RED" "$OFF" "$LOGFILE"
  printf '%s     Server có đang chạy qua ./setup/mac/run.sh be không?%s\n' "$DIM" "$OFF"
  printf '%s     Log ở chỗ khác thì: NOOK_LOG=<đường dẫn> ./backend/scripts/smoke-auth.sh%s\n' "$DIM" "$OFF"
  exit 1
fi

# ── 2. Chặn xin dồn ─────────────────────────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' \
      -d "{\"method\":\"email\",\"target\":\"$MAIL\"}")
check "xin lại ngay thì bị chặn" "auth.code_too_soon" "$(echo "$R" | code_of)"

# ── 3. Mã sai ───────────────────────────────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
      -d "{\"method\":\"email\",\"target\":\"$MAIL\",\"code\":\"000000\"}")
check "mã sai bị từ chối" "auth.code_invalid" "$(echo "$R" | code_of)"

# ── 4. Mã đúng ──────────────────────────────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
      -d "{\"method\":\"email\",\"target\":\"$MAIL\",\"code\":\"$CODE\"}")
check "mã đúng thì vào được" "auth.signed_in" "$(echo "$R" | code_of)"
check "tài khoản mở mới" "True" "$(echo "$R" | field "['isNew']")"
A1=$(echo "$R" | field "['accessToken']"); R1=$(echo "$R" | field "['refreshToken']")

# ── 5. Mã dùng một lần ──────────────────────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
      -d "{\"method\":\"email\",\"target\":\"$MAIL\",\"code\":\"$CODE\"}")
check "mã dùng lại lần hai thì hết hạn" "auth.code_expired" "$(echo "$R" | code_of)"

# ── 6. Thẻ dùng được ────────────────────────────────────────────────────────
R=$(curl -s "$BASE/v1/me" -H "authorization: Bearer $A1")
check "thẻ mở được hồ sơ" "ok" "$(echo "$R" | code_of)"

# ── 7. Xoay thẻ NGAY — ca từng hỏng ─────────────────────────────────────────
#
# Không có `sleep` ở đây, và đó là CHỦ Ý: làm mới thẻ trong cùng một giây với
# lúc đăng nhập từng cho ra thẻ giống hệt thẻ cũ (ruột thẻ chỉ có sub/sid/typ
# và iat tính bằng giây), nên việc xoay thẻ không xảy ra. Nay mỗi thẻ mang một
# `jti` ngẫu nhiên. Thêm `sleep` vào đây là che mất chính cái bẫy này.
R=$(curl -s -X POST "$BASE/v1/auth/refresh" -H 'content-type: application/json' \
      -d "{\"refreshToken\":\"$R1\"}")
check "làm mới thẻ" "auth.token_refreshed" "$(echo "$R" | code_of)"
R2=$(echo "$R" | field "['refreshToken']")
if [ "$R1" != "$R2" ]; then PASS=$((PASS+1)); printf '%s  ✓%s thẻ mới KHÁC thẻ cũ (cùng một giây)\n' "$GREEN" "$OFF"
else FAIL=$((FAIL+1)); printf '%s  ✗%s thẻ mới GIỐNG thẻ cũ — việc xoay thẻ không xảy ra\n' "$RED" "$OFF"; fi

# ── 8. Thẻ cũ bị chép → thu hết phiên ───────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/auth/refresh" -H 'content-type: application/json' -d "{\"refreshToken\":\"$R1\"}")
check "xài lại thẻ cũ bị chặn" "auth.session_revoked" "$(echo "$R" | code_of)"
R=$(curl -s "$BASE/v1/me" -H "authorization: Bearer $A1")
check "thẻ ngắn hạn chết theo phiên" "auth.session_revoked" "$(echo "$R" | code_of)"
R=$(curl -s -X POST "$BASE/v1/auth/refresh" -H 'content-type: application/json' -d "{\"refreshToken\":\"$R2\"}")
check "thẻ mới cũng chết theo" "auth.session_revoked" "$(echo "$R" | code_of)"

# ── 9. Đường chưa mở ────────────────────────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' \
      -d '{"method":"phone","target":"0901234567"}')
check "số điện thoại báo chưa mở" "auth.method_unavailable" "$(echo "$R" | code_of)"

# ── 10. Cổng thẻ ────────────────────────────────────────────────────────────
check "không thẻ thì không vào" "auth.unauthorized" "$(curl -s "$BASE/v1/me" | code_of)"
check "đường không có" "common.not_found" "$(curl -s "$BASE/v1/khong-co" | code_of)"

echo
if [ "$FAIL" -eq 0 ]; then printf '%s%sĐẠT — %d/%d%s\n' "$BOLD" "$GREEN" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 0
else printf '%s%sHỎNG — %d/%d%s\n' "$BOLD" "$RED" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 1; fi
