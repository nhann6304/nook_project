#!/usr/bin/env bash
#
# Chạy thử phần CHỐNG BOT của luồng đăng nhập, trên server ĐANG chạy.
#
#   setup\win\run.bat be                 # cửa sổ 1 (hoặc: cd backend && npm run dev)
#   bash backend/scripts/smoke-antibot.sh    # cửa sổ 2
#
# Năm lỗ, mỗi lỗ một mục. Đọc mã 6 số từ log server (CODE_SENDER=console) nên
# chỉ chạy được ở máy dev. Kết thúc bằng một dòng ĐẠT / HỎNG.
set -uo pipefail

BASE="${BASE:-http://localhost:4000}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGFILE="${NOOK_LOG:-$ROOT/.logs/server.log}"
REDIS="${NOOK_REDIS:-nook-redis}"
GREEN=$'\033[32m'; RED=$'\033[31m'; DIM=$'\033[2m'; BOLD=$'\033[1m'; OFF=$'\033[0m'

PASS=0; FAIL=0
check() { # check "tên" "mong đợi" "nhận được"
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); printf '%s  ✓%s %s\n' "$GREEN" "$OFF" "$1"
  else FAIL=$((FAIL+1)); printf '%s  ✗%s %s %s(mong %s, nhận %s)%s\n' "$RED" "$OFF" "$1" "$DIM" "$2" "$3" "$OFF"; fi
}

# Node, KHÔNG python3 — xem ghi chú ở `smoke-auth.sh`.
json() { node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{try{const d=JSON.parse(s);console.log($1)}catch{}})" 2>/dev/null; }
code_of() { json "d.code ?? ''"; }
field()   { json "d['data']$1"; }

redis() { docker exec "$REDIS" redis-cli "$@" 2>/dev/null; }

curl -sf "$BASE/health" >/dev/null || { echo "${RED}Server chưa chạy ở $BASE${OFF}"; exit 1; }
redis ping >/dev/null || { echo "${RED}Không gọi được Redis trong container '$REDIS'${OFF}"; exit 1; }

ask() { # ask <email> [header...]  -> in ra mã lỗi
  local mail=$1; shift
  curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' "$@" \
       -d "{\"method\":\"email\",\"target\":\"$mail\"}" | code_of
}

read_code() { grep -o 'code: [0-9]\{6\}' "$LOGFILE" 2>/dev/null | tail -1 | awk '{print $2}'; }

login() { # login <email>  -> in ra "<userId> <isNew>"
  ask "$1" >/dev/null
  sleep 0.4
  local c; c=$(read_code)
  local r; r=$(curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
                 -d "{\"method\":\"email\",\"target\":\"$1\",\"code\":\"$c\"}")
  printf '%s %s' "$(echo "$r" | field "['user']['id']")" "$(echo "$r" | field "['isNew']")"
}

# Script này gọi mấy chục lần, mà trần theo máy gọi là 30/giờ (xin mã) và
# 60/giờ (nộp mã). Không dọn thì chạy hai lượt trong một giờ là lượt sau hỏng
# oan. Máy dev nên xoá thẳng khoá; server không có đường nào tự nới.
redis --scan --pattern 'auth:hour:ip:*'  | xargs -r docker exec "$REDIS" redis-cli DEL >/dev/null 2>&1
redis --scan --pattern 'auth:verify:ip:*'| xargs -r docker exec "$REDIS" redis-cli DEL >/dev/null 2>&1

R=$RANDOM

# ── LỖ 1 · Giả IP bằng X-Forwarded-For ──────────────────────────────────────
#
# Fastify với `trustProxy: true` lấy giá trị TRÁI NHẤT của header đó — giá trị
# client tự gõ. Khi đó mọi trần đếm theo IP chỉ cần đổi header là đi qua sạch.
printf '\n%s▸ LỖ 1 — giả IP%s\n' "$BOLD" "$OFF"
FAKE="203.0.113.$((R % 200 + 10))"
ask "xff$R@nook.test" -H "X-Forwarded-For: $FAKE" >/dev/null
check "IP bịa KHÔNG tạo ra xô đếm riêng" "" "$(redis exists "auth:hour:ip:$FAKE" | grep -w 1)"
check "vẫn đếm vào IP thật"              "1" "$(redis exists 'auth:hour:ip:127.0.0.1')"

# ── LỖ 2 · Một HỘP THƯ = một tài khoản ──────────────────────────────────────
#
# `nam@gmail.com`, `nam+947@gmail.com`, `n.a.m@gmail.com` là ba chuỗi khác nhau
# nhưng cùng một hộp thư. Khoá đặt trên chuỗi thì một hộp Gmail thật mở được vô
# hạn tài khoản Nook, mỗi cái đều nhận được mã nên đều "đã xác minh" hợp lệ.
printf '\n%s▸ LỖ 2 — một hộp thư một tài khoản%s\n' "$BOLD" "$OFF"
read -r ID0 NEW0 <<<"$(login "bot$R@gmail.com")"
check "mở tài khoản mới"                     "true" "$NEW0"
read -r ID1 NEW1 <<<"$(login "bot$R+947@gmail.com")"
check "nhãn sau dấu + vào CÙNG tài khoản"    "$ID0" "$ID1"
check "và không phải tài khoản mới"          "false" "$NEW1"
read -r ID2 _ <<<"$(login "b.o.t$R@gmail.com")"
check "Gmail bỏ dấu chấm, vẫn CÙNG tài khoản" "$ID0" "$ID2"

# Chiều ngược lại — quan trọng hơn: gộp THỪA là nhốt hai người thật vào một
# tài khoản, hỏng nặng hơn nhiều so với để lọt vài tài khoản rác.
read -r ID3 _ <<<"$(login "bot$R@nook.test")"
read -r ID4 _ <<<"$(login "b.o.t$R@nook.test")"
if [ -n "$ID3" ] && [ "$ID3" != "$ID4" ]; then PASS=$((PASS+1))
  printf '%s  ✓%s ngoài Gmail thì dấu chấm GIỮ NGUYÊN — hai người, hai tài khoản\n' "$GREEN" "$OFF"
else FAIL=$((FAIL+1))
  printf '%s  ✗%s gộp THỪA: hai người thật bị nhốt chung một tài khoản\n' "$RED" "$OFF"; fi

check "cửa tạo mới soi được cả email có nhãn" "auth.account_exists" \
  "$(curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' \
       -d "{\"method\":\"email\",\"target\":\"bot$R+xyz@gmail.com\",\"intent\":\"signup\"}" | code_of)"

# ── LỖ 3 · Hộp thư dùng một lần ─────────────────────────────────────────────
printf '\n%s▸ LỖ 3 — hộp thư dùng một lần%s\n' "$BOLD" "$OFF"
check "mailinator.com bị chặn" "auth.target_not_allowed" "$(ask "a$R@mailinator.com")"
check "yopmail.com bị chặn"    "auth.target_not_allowed" "$(ask "a$R@yopmail.com")"
check "email thường KHÔNG bị chặn oan" "auth.code_sent"  "$(ask "that$R@nook.test")"

# ── LỖ 4 · Dấu vân mã là HMAC, không phải argon2 ────────────────────────────
#
# Argon2 chống bẻ khoá NGOẠI TUYẾN — thứ không phải mối lo với một cái mã sống
# 300 giây, sai 5 lần là chết. Cái nó gây ra thì có thật: 64 MB và một chỗ
# trong hàng đợi bốn luồng của libuv, cho MỖI lần xin mã.
printf '\n%s▸ LỖ 4 — dấu vân mã%s\n' "$BOLD" "$OFF"
HMAIL="hash$R@nook.test"
ask "$HMAIL" >/dev/null
HASH="$(redis hget "auth:code:email:$HMAIL" hash)"
check "là HMAC-SHA256 (hex 64)" "ok" "$(echo "$HASH" | grep -qE '^[0-9a-f]{64}$' && echo ok)"
check "KHÔNG còn là argon2"     ""   "$(echo "$HASH" | grep -o '^\$argon2')"

# ── LỖ 5 · Trần nộp mã theo máy gọi ─────────────────────────────────────────
#
# Không phải để chống đoán mã (5 lần sai là mã chết). Cái này bịt chỗ khác:
# `/auth/verify` từng là cửa duy nhất không có trần nào.
printf '\n%s▸ LỖ 5 — trần nộp mã%s\n' "$BOLD" "$OFF"
HIT=""
for i in $(seq 1 70); do
  C=$(curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
        -d "{\"method\":\"email\",\"target\":\"spam$R-$i@nook.test\",\"code\":\"000000\"}" | code_of)
  if [ "$C" = "auth.verify_too_many_here" ]; then HIT=$i; break; fi
done
check "bắn liên tục vào /auth/verify thì bị chặn" "auth.verify_too_many_here" \
  "${HIT:+auth.verify_too_many_here}"
# Trần là 60/giờ, nhưng phần LỖ 2 ở trên đã tiêu 5 lượt nộp mã rồi — nên con số
# đúng ở đây là 56, không phải 61. Ghi ra để khỏi tưởng là lệch.
[ -n "$HIT" ] && printf '%s     chặn ở lần thứ %s (trần 60/giờ, phần trên đã tiêu 5)%s\n' "$DIM" "$HIT" "$OFF"

# Dọn lại, để chạy bài khác ngay sau đó không bị hỏng oan.
redis --scan --pattern 'auth:hour:ip:*'  | xargs -r docker exec "$REDIS" redis-cli DEL >/dev/null 2>&1
redis --scan --pattern 'auth:verify:ip:*'| xargs -r docker exec "$REDIS" redis-cli DEL >/dev/null 2>&1

echo
if [ "$FAIL" -eq 0 ]; then printf '%s%sĐẠT — %d/%d%s\n' "$BOLD" "$GREEN" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 0
else printf '%s%sHỎNG — %d/%d%s\n' "$BOLD" "$RED" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 1; fi
