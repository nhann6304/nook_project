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

source "$(dirname "${BASH_SOURCE[0]}")/db.sh"

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

# Trần "xin mã theo MÁY GỌI" là 30/giờ, mà chính script này gọi mấy chục lần.
# Không dọn thì chạy hai lượt trong một giờ là lượt sau hỏng oan. Đây là script
# ở máy dev nên xoá thẳng khoá trong Redis; server không có đường nào tự nới.
clear_ip_budget() {
  docker exec nook-redis sh -c \
    "redis-cli --scan --pattern 'auth:hour:ip:*' | xargs -r redis-cli DEL" >/dev/null 2>&1 || true
}
clear_ip_budget

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

# ── 8. Thẻ đời trước, NGAY sau khi xoay: coi là thử lại lành ────────────────
#
# Trên điện thoại đây là chuyện thường ngày: hai lệnh gọi cùng dính 401 rồi
# cùng đi làm mới, hoặc mạng chập chờn nên app gửi lại đúng lệnh đó. Chấm nó là
# "thẻ bị chép" rồi thu hết phiên là đá người dùng ra khỏi app vì sóng yếu.
R=$(curl -s -X POST "$BASE/v1/auth/refresh" -H 'content-type: application/json' -d "{\"refreshToken\":\"$R1\"}")
check "thẻ đời trước trong khoảng ân hạn: nhận" "auth.token_refreshed" "$(echo "$R" | code_of)"
check "phiên KHÔNG bị thu hồi oan" "ok" "$(curl -s "$BASE/v1/me" -H "authorization: Bearer $A1" | code_of)"

# ── 9. Cùng thẻ đó, NGOÀI khoảng ân hạn: thẻ bị chép, thu hết phiên ─────────
#
# Lùi `rotated_at` cho quá khoảng ân hạn — đúng cảnh kẻ chép được thẻ rồi đem
# dùng sau đó một lúc.
db_one \
  "UPDATE sessions SET rotated_at = now() - interval '5 minutes' WHERE revoked_at IS NULL" >/dev/null 2>&1
R=$(curl -s -X POST "$BASE/v1/auth/refresh" -H 'content-type: application/json' -d "{\"refreshToken\":\"$R1\"}")
check "ngoài khoảng ân hạn: thu hết phiên" "auth.session_revoked" "$(echo "$R" | code_of)"
check "thẻ ngắn hạn chết theo phiên" "auth.session_revoked" "$(curl -s "$BASE/v1/me" -H "authorization: Bearer $A1" | code_of)"
check "thẻ mới cũng chết theo" "auth.session_revoked" \
  "$(curl -s -X POST "$BASE/v1/auth/refresh" -H 'content-type: application/json' -d "{\"refreshToken\":\"$R2\"}" | code_of)"

# ── 9b. Phiên tự gia hạn — "đăng nhập một lần rồi thôi" ────────────────────
#
# Hạn của thẻ dài hạn phải ĐẨY RA XA mỗi lần app làm mới thẻ. Không có chuyện
# đó thì người dùng bị đá ra sau đúng JWT_REFRESH_TTL dù ngày nào cũng mở app —
# đúng thứ mà cả thiết kế này sinh ra để tránh.
psql_one() { db_one "$1"; }

SMAIL="slide$RANDOM@nook.test"
curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' \
  -d "{\"method\":\"email\",\"target\":\"$SMAIL\"}" >/dev/null
SCODE="$(read_code)"
SOUT=$(curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
  -d "{\"method\":\"email\",\"target\":\"$SMAIL\",\"code\":\"$SCODE\"}")
SREF=$(echo "$SOUT" | field "['refreshToken']")

# Lùi hạn về gần, giả cảnh phiên đã dùng được một thời gian dài.
SID=$(psql_one "SELECT id FROM sessions WHERE revoked_at IS NULL ORDER BY created_at DESC LIMIT 1")
HALF_TTL=$(( $(env_of JWT_REFRESH_TTL) / 2 ))
psql_one "UPDATE sessions SET expires_at = now() + interval '$HALF_TTL seconds' WHERE id = '$SID'" >/dev/null
BEFORE_EXP=$(psql_one "SELECT expires_at FROM sessions WHERE id = '$SID'")

curl -s -X POST "$BASE/v1/auth/refresh" -H 'content-type: application/json' \
  -d "{\"refreshToken\":\"$SREF\"}" >/dev/null
AFTER_EXP=$(psql_one "SELECT expires_at FROM sessions WHERE id = '$SID'")

MOVED=$(psql_one "SELECT CASE WHEN '$AFTER_EXP'::timestamptz > '$BEFORE_EXP'::timestamptz THEN 'xa hon' ELSE 'khong doi' END")
check "mở app là hạn phiên đẩy ra xa" "xa hon" "$MOVED"
printf '%s     %s  ->  %s%s\n' "$DIM" "${BEFORE_EXP:0:10}" "${AFTER_EXP:0:10}" "$OFF"

# ── 10. Hai cửa của giao diện: "đã có tài khoản" và "tạo tài khoản mới" ────
#
# `intent` cho app biết người ta bấm vào từ đâu, để server nói được "email này
# chưa ai dùng" NGAY tại chỗ, thay vì bắt chờ một lá thư không bao giờ tới.
#
# `send` tự dựng thân JSON, cố ý. Viết thẳng `"$(send "{\"method\":...}")"` thì
# bash ăn mất dấu ngoặc kép ở lớp ngoài rồi BUNG NGOẶC NHỌN cái còn lại thành
# ba mảnh — server nhận rác và trả 400, mà nhìn dòng lệnh thì không thấy gì sai.
send() { # send <đích> [cửa]
  local body="{\"method\":\"email\",\"target\":\"$1\"}"
  [ -n "${2:-}" ] && body="{\"method\":\"email\",\"target\":\"$1\",\"intent\":\"$2\"}"
  curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' -d "$body"
}
send_code() { send "$@" | code_of; }

CHUA="chuadk$RANDOM@nook.test"
check "cửa đăng nhập + email chưa đăng ký" "auth.account_not_found" "$(send_code "$CHUA" signin)"
check "cửa đăng nhập + email đã có"        "auth.code_sent"         "$(send_code "$MAIL" signin)"
check "cửa tạo mới + email đã có"          "auth.account_exists"    "$(send_code "$MAIL" signup)"
check "cửa tạo mới + email chưa có"        "auth.code_sent"         "$(send_code "$CHUA" signup)"
check "không nói cửa nào thì không soi"    "auth.code_sent"         "$(send_code "tuido$RANDOM@nook.test")"

# Bị từ chối thì phải KHÔNG gửi thư và KHÔNG đốt chốt 60 giây của người ta —
# nếu không, gõ nhầm cửa một lần là bị treo cả phút mà không hiểu vì sao.
SACH="sach$RANDOM@nook.test"
BEFORE=$(grep -c 'code: [0-9]' "$LOGFILE" 2>/dev/null || echo 0)
check "vào nhầm cửa bị từ chối" "auth.account_not_found" "$(send_code "$SACH" signin)"
sleep 0.4
AFTER=$(grep -c 'code: [0-9]' "$LOGFILE" 2>/dev/null || echo 0)
check "vào nhầm cửa thì không gửi thư"      "$BEFORE"        "$AFTER"
check "vào nhầm cửa không khoá mất 60 giây" "auth.code_sent" "$(send_code "$SACH")"

# ── 11. Chốt chống quét danh sách email ────────────────────────────────────
#
# Từ lúc cửa này biết nói "email chưa có tài khoản", nó cũng thành máy tra cứu
# "ai đang dùng Nook". Trần theo máy gọi là thứ DUY NHẤT cản việc đó — mất nó
# là mất luôn quyền riêng tư của toàn bộ người dùng, nên ca này phải còn.
clear_ip_budget
HIT=""
for i in $(seq 1 40); do
  if [ "$(send_code "quet$i-$RANDOM@nook.test" signin)" = "auth.code_too_many_here" ]; then HIT="$i"; break; fi
done
check "quét nhiều email liên tiếp thì bị chặn" "chặn" "$([ -n "$HIT" ] && echo "chặn" || echo "lọt hết 40")"
[ -n "$HIT" ] && printf '%s     chặn ở email thứ %s%s\n' "$DIM" "$HIT" "$OFF"
clear_ip_budget

# ── 12. Đường chưa mở ───────────────────────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' \
      -d '{"method":"phone","target":"0901234567"}')
check "số điện thoại báo chưa mở" "auth.method_unavailable" "$(echo "$R" | code_of)"

# ── 13. Cổng thẻ ────────────────────────────────────────────────────────────
check "không thẻ thì không vào" "auth.unauthorized" "$(curl -s "$BASE/v1/me" | code_of)"
check "đường không có" "common.not_found" "$(curl -s "$BASE/v1/khong-co" | code_of)"

echo
if [ "$FAIL" -eq 0 ]; then printf '%s%sĐẠT — %d/%d%s\n' "$BOLD" "$GREEN" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 0
else printf '%s%sHỎNG — %d/%d%s\n' "$BOLD" "$RED" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 1; fi
