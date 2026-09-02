#!/usr/bin/env bash
#
# Chay thu ten rieng: soi dang, giu cho, va cuoc dua hai nguoi cung chon.
set -uo pipefail
BASE="${BASE:-http://localhost:4000}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGFILE="${NOOK_LOG:-$ROOT/.logs/server.log}"
GREEN=$'\033[32m'; RED=$'\033[31m'; BOLD=$'\033[1m'; DIM=$'\033[2m'; OFF=$'\033[0m'

source "$(dirname "${BASH_SOURCE[0]}")/db.sh"

PASS=0; FAIL=0
check() { if [ "$2" = "$3" ]; then PASS=$((PASS+1)); printf '%s  ✓%s %s\n' "$GREEN" "$OFF" "$1"
          else FAIL=$((FAIL+1)); printf '%s  ✗%s %s %s(mong %s, nhận %s)%s\n' "$RED" "$OFF" "$1" "$DIM" "$2" "$3" "$OFF"; fi; }
code_of() { python3 -c "import sys,json;print(json.load(sys.stdin).get('code',''))" 2>/dev/null; }
field()   { python3 -c "import sys,json;print(json.load(sys.stdin)['data']$1)" 2>/dev/null; }

login() {
  curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' -d "{\"method\":\"email\",\"target\":\"$1\"}" >/dev/null
  sleep 0.4
  local c; c=$(grep -o 'code: [0-9]\{6\}' "$LOGFILE" | tail -1 | awk '{print $2}')
  curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
       -d "{\"method\":\"email\",\"target\":\"$1\",\"code\":\"$c\"}" | field "['accessToken']"
}
# Mã hoá URL đàng hoàng — tên có dấu hay có ký tự lạ thì gửi thô là hỏng, và
# hỏng ở phía TEST chứ không phải phía server.
# `curl` tren Windows nhan tham so qua BANG MA cua console: chu co dau bien
# thanh '?' truoc khi ra khoi may, va bai kiem bo dau that bai oan. Tu ma hoa
# thanh %XX bang bash thi duong gui di chi con ASCII, dung o ca ba he.
urlenc() (
  LC_ALL=C                      # dem theo BYTE, khong theo ky tu
  local s=$1 out= i c
  for ((i = 0; i < ${#s}; i++)); do
    c=${s:i:1}
    case $c in [a-zA-Z0-9.~_-]) out+=$c ;; *) out+=$(printf '%%%02X' "'$c") ;; esac
  done
  printf '%s' "$out"
)

avail() { curl -s "$BASE/v1/username/check?username=$(urlenc "$1")" -H "authorization: Bearer $2"; }

curl -sf "$BASE/health" >/dev/null || { echo "${RED}Server chưa chạy${OFF}"; exit 1; }
A="$(login "u1-$RANDOM@nook.test")"; B="$(login "u2-$RANDOM@nook.test")"
[ -n "$A" ] && [ -n "$B" ] || { echo "${RED}không đăng nhập được${OFF}"; exit 1; }
NAME="nam$RANDOM"

# ── soi dạng: server tra loi dung ma, khong phai loi chung chung ────────────
check "tên quá ngắn"           "username.invalid"  "$(avail "ab" "$A" | field "['problem']")"
check "tên có khoảng trắng"    "username.invalid"  "$(avail "nam anh" "$A" | field "['problem']")"
check "tên giữ chỗ (admin)"    "username.reserved" "$(avail "admin" "$A" | field "['problem']")"
check "tên hai dấu liền nhau"  "username.invalid"  "$(avail "nam..anh" "$A" | field "['problem']")"

# ── chuan hoa ──────────────────────────────────────────────────────────────
check "chữ hoa về chữ thường"  "namnguyen" "$(avail "NamNguyen" "$A" | field "['key']")"
check "bỏ dấu tiếng Việt"      "ducanh"    "$(avail "ĐứcAnh" "$A" | field "['key']")"

# ── con trong -> giu cho -> khong con trong ────────────────────────────────
check "chưa ai lấy thì còn trống" "True" "$(avail "$NAME" "$A" | field "['available']")"
R=$(curl -s -X PATCH "$BASE/v1/me" -H "authorization: Bearer $A" -H 'content-type: application/json' -d "{\"username\":\"$NAME\"}")
check "giữ chỗ được"           "user.profile_updated" "$(echo "$R" | code_of)"
check "hồ sơ hiện tên riêng"   "$NAME" "$(echo "$R" | field "['username']")"
check "sau khi giữ thì hết trống" "False" "$(avail "$NAME" "$B" | field "['available']")"
check "lý do là đã có người lấy"  "username.taken" "$(avail "$NAME" "$B" | field "['problem']")"

# ── nguoi khac lay ten do -> bi chan ───────────────────────────────────────
check "người khác lấy tên đó thì bị chặn" "username.taken" \
  "$(curl -s -X PATCH "$BASE/v1/me" -H "authorization: Bearer $B" -H 'content-type: application/json' -d "{\"username\":\"$NAME\"}" | code_of)"
check "lấy bằng CHỮ HOA cũng bị chặn" "username.taken" \
  "$(curl -s -X PATCH "$BASE/v1/me" -H "authorization: Bearer $B" -H 'content-type: application/json' -d "{\"username\":\"$(echo "$NAME" | tr 'a-z' 'A-Z')\"}" | code_of)"

# ── CUOC DUA: hai nguoi bam chon CUNG LUC ──────────────────────────────────
RACE="race$RANDOM"
C="$(login "u3-$RANDOM@nook.test")"; D="$(login "u4-$RANDOM@nook.test")"
r1=$(mktemp); r2=$(mktemp)
curl -s -X PATCH "$BASE/v1/me" -H "authorization: Bearer $C" -H 'content-type: application/json' -d "{\"username\":\"$RACE\"}" -o "$r1" &
curl -s -X PATCH "$BASE/v1/me" -H "authorization: Bearer $D" -H 'content-type: application/json' -d "{\"username\":\"$RACE\"}" -o "$r2" &
wait
WON=$(( $(code_of < "$r1" | grep -c 'user.profile_updated') + $(code_of < "$r2" | grep -c 'user.profile_updated') ))
check "hai người chọn cùng lúc: đúng MỘT người thắng" "1" "$WON"
LOST=$(( $(code_of < "$r1" | grep -c 'username.taken') + $(code_of < "$r2" | grep -c 'username.taken') ))
check "người thua nhận đúng mã username.taken" "1" "$LOST"
rm -f "$r1" "$r2"

echo
if [ "$FAIL" -eq 0 ]; then printf '%s%sĐẠT — %d/%d%s\n' "$BOLD" "$GREEN" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 0
else printf '%s%sHỎNG — %d/%d%s\n' "$BOLD" "$RED" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 1; fi
