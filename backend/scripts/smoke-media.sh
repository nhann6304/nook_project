#!/usr/bin/env bash
#
# Chạy thử đường ảnh bằng MỘT TẤM ẢNH THẬT, trên server đang chạy.
#
# Điểm phải chứng minh: bản gốc lên kho ĐÚNG TỪNG BYTE. Không bóp, không nén
# lại, không đổi định dạng.
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

curl -sf "$BASE/health" >/dev/null || { echo "${RED}Server chưa chạy${OFF}"; exit 1; }

# ── một tấm ảnh thật, ~1.5MB, nhiều nhiễu nên nén lại là đổi byte ngay ──────
IMG="$(mktemp -t nook).jpg"
python3 - "$IMG" <<'PY'
import sys, zlib, struct, os
w = h = 700
rnd = os.urandom(w * h * 3)
raw = b''.join(b'\x00' + rnd[y*w*3:(y+1)*w*3] for y in range(h))
def chunk(t, d):
    c = t + d
    return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
png = (b'\x89PNG\r\n\x1a\n'
       + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
       + chunk(b'IDAT', zlib.compress(raw, 1))
       + chunk(b'IEND', b''))
open(sys.argv[1], 'wb').write(png)
PY
SIZE=$(wc -c < "$IMG" | tr -d ' ')
SHA_BEFORE=$(shasum -a 256 "$IMG" | awk '{print $1}')
printf '%s▸%s Ảnh thử: %s byte  ·  sha256 %s…\n' "$BOLD" "$OFF" "$SIZE" "${SHA_BEFORE:0:16}"

# ── đăng nhập ───────────────────────────────────────────────────────────────
MAIL="media$RANDOM@nook.test"
curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' -d "{\"method\":\"email\",\"target\":\"$MAIL\"}" >/dev/null
sleep 0.4
CODE=$(grep -o 'code: [0-9]\{6\}' "$LOGFILE" | tail -1 | awk '{print $2}')
A=$(curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
     -d "{\"method\":\"email\",\"target\":\"$MAIL\",\"code\":\"$CODE\"}" | field "['accessToken']")
[ -n "$A" ] || { echo "${RED}không đăng nhập được${OFF}"; exit 1; }

# ── 1. xin đường tải lên ────────────────────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/media/upload-url" -H "authorization: Bearer $A" -H 'content-type: application/json' \
     -d "{\"kind\":\"avatar\",\"contentType\":\"image/png\",\"byteSize\":$SIZE,\"width\":700,\"height\":700}")
check "xin được đường tải lên" "ok" "$(echo "$R" | code_of)"
MID=$(echo "$R" | field "['mediaId']"); URL=$(echo "$R" | field "['uploadUrl']")
printf '%s     %s%s\n' "$DIM" "$(echo "$URL" | cut -c1-95)…" "$OFF"

# ── 2. báo xong khi CHƯA tải gì ─────────────────────────────────────────────
check "chưa tải mà báo xong thì bị chặn" "media.not_uploaded" \
      "$(curl -s -X POST "$BASE/v1/media/$MID/complete" -H "authorization: Bearer $A" | code_of)"

# ── 3. đẩy bytes THẲNG lên kho, không qua server ────────────────────────────
HTTP=$(curl -s -o /dev/null -w '%{http_code}' -X PUT "$URL" \
        -H "content-type: image/png" --data-binary "@$IMG")
check "PUT thẳng lên kho" "200" "$HTTP"

# ── 4. báo xong ─────────────────────────────────────────────────────────────
R=$(curl -s -X POST "$BASE/v1/media/$MID/complete" -H "authorization: Bearer $A")
check "server soi kho rồi nhận" "ok" "$(echo "$R" | code_of)"
check "trạng thái" "ready" "$(echo "$R" | field "['status']")"
check "dung lượng kho báo == dung lượng thật" "$SIZE" "$(echo "$R" | field "['byteSize']")"

# ── 5. tải về, so từng byte ─────────────────────────────────────────────────
OUT="$(mktemp -t nookout)"
curl -s -L "$BASE/v1/media/$MID" -H "authorization: Bearer $A" -o "$OUT"
SHA_AFTER=$(shasum -a 256 "$OUT" | awk '{print $1}')
check "tải về nguyên vẹn — sha256 KHỚP" "$SHA_BEFORE" "$SHA_AFTER"
check "dung lượng tải về == lúc gửi" "$SIZE" "$(wc -c < "$OUT" | tr -d ' ')"

# ── 6. ảnh của người khác ───────────────────────────────────────────────────
MAIL2="other$RANDOM@nook.test"
curl -s -X POST "$BASE/v1/auth/code" -H 'content-type: application/json' -d "{\"method\":\"email\",\"target\":\"$MAIL2\"}" >/dev/null
sleep 0.4
C2=$(grep -o 'code: [0-9]\{6\}' "$LOGFILE" | tail -1 | awk '{print $2}')
B=$(curl -s -X POST "$BASE/v1/auth/verify" -H 'content-type: application/json' \
     -d "{\"method\":\"email\",\"target\":\"$MAIL2\",\"code\":\"$C2\"}" | field "['accessToken']")
check "người khác KHÔNG xem được" "media.forbidden" \
      "$(curl -s "$BASE/v1/media/$MID" -H "authorization: Bearer $B" | code_of)"
check "không thẻ thì cũng không" "auth.unauthorized" "$(curl -s "$BASE/v1/media/$MID" | code_of)"

# ── 7. đặt làm ảnh đại diện ─────────────────────────────────────────────────
R=$(curl -s -X PATCH "$BASE/v1/me" -H "authorization: Bearer $A" -H 'content-type: application/json' \
     -d "{\"avatarMediaId\":\"$MID\"}")
check "đặt làm ảnh đại diện" "user.profile_updated" "$(echo "$R" | code_of)"
check "hồ sơ trỏ đúng ảnh" "/v1/media/$MID" "$(echo "$R" | field "['avatarUrl']")"
check "ảnh của người khác thì không đặt được" "media.forbidden" \
      "$(curl -s -X PATCH "$BASE/v1/me" -H "authorization: Bearer $B" -H 'content-type: application/json' \
          -d "{\"avatarMediaId\":\"$MID\"}" | code_of)"

# ── 8. trần dung lượng ──────────────────────────────────────────────────────
check "tệp quá to bị chặn từ lúc xin đường" "common.bad_request" \
      "$(curl -s -X POST "$BASE/v1/media/upload-url" -H "authorization: Bearer $A" -H 'content-type: application/json' \
          -d '{"kind":"avatar","contentType":"image/png","byteSize":99999999}' | code_of)"
check "định dạng lạ bị chặn" "common.bad_request" \
      "$(curl -s -X POST "$BASE/v1/media/upload-url" -H "authorization: Bearer $A" -H 'content-type: application/json' \
          -d '{"kind":"avatar","contentType":"application/zip","byteSize":1000}' | code_of)"

# ── 9. bản nhẹ dựng ở việc nền ──────────────────────────────────────────────
printf '%s     chờ việc nền dựng bản nhẹ…%s\n' "$DIM" "$OFF"
for _ in $(seq 1 20); do
  V=$(PGPASSWORD=nook psql -h localhost -p 5432 -U nook -d nook -tA -c \
      "SELECT count(*) FROM media_variants WHERE media_id='$MID' AND status='ready'" 2>/dev/null | tr -d '[:space:]')
  [ "$V" = "2" ] && break
  sleep 1
done
check "dựng đủ 2 bản nhẹ" "2" "${V:-0}"

PGPASSWORD=nook psql -h localhost -p 5432 -U nook -d nook -tA -c \
  "SELECT '     ' || variant || ': ' || width || 'px  ' || byte_size || ' byte  (' ||
          round((SELECT byte_size FROM media WHERE id='$MID')::numeric / byte_size, 1) || 'x nhẹ hơn)'
   FROM media_variants WHERE media_id='$MID' ORDER BY width DESC" 2>/dev/null

FEED="$(mktemp -t nookfeed)"
curl -s -L "$BASE/v1/media/$MID?variant=feed" -H "authorization: Bearer $A" -o "$FEED"
FEED_SIZE=$(wc -c < "$FEED" | tr -d ' ')
[ "$FEED_SIZE" -lt "$SIZE" ] && check "bản feed tải về NHẸ hơn bản gốc" "nhẹ hơn" "nhẹ hơn" \
  || check "bản feed tải về NHẸ hơn bản gốc" "nhẹ hơn" "$FEED_SIZE >= $SIZE"
check "bản feed là WebP" "RIFF" "$(head -c 4 "$FEED")"

# Bản GỐC vẫn phải nguyên vẹn sau khi dựng bản nhẹ
ORIG2="$(mktemp -t nookorig2)"
curl -s -L "$BASE/v1/media/$MID" -H "authorization: Bearer $A" -o "$ORIG2"
check "bản GỐC vẫn nguyên sau khi dựng bản nhẹ" "$SHA_BEFORE" "$(shasum -a 256 "$ORIG2" | awk '{print $1}')"

check "xin bản không có tên thì bị chặn" "common.bad_request" \
      "$(curl -s "$BASE/v1/media/$MID?variant=khongco" -H "authorization: Bearer $A" | code_of)"

rm -f "$IMG" "$OUT" "$FEED" "$ORIG2"
echo
if [ "$FAIL" -eq 0 ]; then printf '%s%sĐẠT — %d/%d%s\n' "$BOLD" "$GREEN" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 0
else printf '%s%sHỎNG — %d/%d%s\n' "$BOLD" "$RED" "$PASS" "$((PASS+FAIL))" "$OFF"; exit 1; fi
