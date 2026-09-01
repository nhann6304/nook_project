#!/usr/bin/env bash
#
# Đẩy mã lên GitHub — có kiểm trước.
#
#   ./setup/mac/push.sh "sửa màn đăng nhập"
#
# Nó KHÔNG đẩy nếu mã chưa dịch được hoặc lint còn kêu. Đẩy một bản hỏng lên
# nhánh chung là làm mất buổi sáng của người kéo về sau.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

BOLD=$'\033[1m'; DIM=$'\033[2m'; GREEN=$'\033[32m'; RED=$'\033[31m'; YEL=$'\033[33m'; OFF=$'\033[0m'
say() { printf '%s▸%s %s\n' "$BOLD" "$OFF" "$1"; }
ok()  { printf '%s  ✓%s %s\n' "$GREEN" "$OFF" "$1"; }
die() { printf '%s  ✗%s %s\n' "$RED" "$OFF" "$1" >&2; exit 1; }

MESSAGE="${1:-}"
[ -n "$MESSAGE" ] || die 'Thiếu lời nhắn. Ví dụ: ./setup/mac/push.sh "sửa màn đăng nhập"'

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Chỗ này không phải kho git."

# ── Không được để lọt bí mật ────────────────────────────────────────────────
say "Soi thứ sắp đẩy"
LEAK="$(git status --porcelain --untracked-files=all | awk '{print $2}' | grep -E '(^|/)\.env($|\.)' | grep -v '\.env\.example' || true)"
[ -z "$LEAK" ] || die "Có file .env đang chờ commit: $LEAK — mở .gitignore ra xem lại."

if git diff --cached --quiet && git diff --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  die "Không có gì để đẩy."
fi
git status --short

# ── Kiểm ────────────────────────────────────────────────────────────────────
say "Kiểm mã (dịch + lint)"
npm run build:shared --silent >/dev/null || die "Gói dùng chung không dịch được."
npm run check --silent            || die "Server chưa qua được vòng kiểm."
if [ -d frontend/node_modules ]; then
  npm run check:fe --silent || die "App chưa qua được vòng kiểm."
else
  printf '%s  · bỏ qua app — chưa cài thư viện%s\n' "$DIM" "$OFF"
fi
ok "sạch"

# ── Nhánh ───────────────────────────────────────────────────────────────────
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  printf '%s  ! Đang đứng thẳng trên %s.%s\n' "$YEL" "$BRANCH" "$OFF"
  read -r -p "  Đẩy thẳng lên đó? [y/N] " ANSWER
  [ "$ANSWER" = "y" ] || [ "$ANSWER" = "Y" ] || die "Dừng. Tách nhánh: git switch -c ten-nhanh"
fi

# ── Đẩy ─────────────────────────────────────────────────────────────────────
say "Đẩy lên $BRANCH"
git add -A
git commit -m "$MESSAGE"
git push -u origin "$BRANCH"
ok "xong"
