#!/usr/bin/env bash
#
# Hoi thang cơ sở dữ liệu, dùng chung cho mấy bài smoke.
#
# KHÔNG dùng `psql`: nó không có sẵn trên Windows, và bản cài trên máy mỗi
# người một tài khoản khác nhau. Node thì chắc chắn có — đây là dự án Node —
# và `pg` đã nằm trong `node_modules`. Tài khoản đọc từ `.env`, nên không còn
# chuỗi nối cứng nào để lệch với máy thật.
#
#   db_one "SELECT count(*) FROM users"   -> in ra đúng MỘT ô, không tiêu đề

BACKEND="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

db_one() {
  NOOK_SQL="$1" NOOK_ENV_FILE="$BACKEND/.env" node -e '
    require("dotenv").config({ path: process.env.NOOK_ENV_FILE, quiet: true });
    const pg = require("pg");
    // Tra ve CHUOI y nhu `psql -tA`, dung kieu JS. `pg` mac dinh doi timestamp
    // thanh `Date`, roi `String(date)` ra "Fri Oct 02 2026 ..." — Postgres khong
    // ep nguoc duoc, va cau lenh sau do im lang tra ve rong.
    for (const oid of [1114, 1184, 1082, 20, 1700]) pg.types.setTypeParser(oid, (v) => v);
    const { Client } = pg;
    const c = new Client({
      host: process.env.DB_HOST, port: +process.env.DB_PORT,
      user: process.env.DB_USER, password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    c.connect()
      .then(() => c.query(process.env.NOOK_SQL))
      .then((r) => { const row = r.rows[0]; if (row) process.stdout.write(String(Object.values(row)[0] ?? "")); })
      .catch((e) => process.stderr.write(String(e.message)))
      .finally(() => c.end());
  ' 2>/dev/null
}

# `mktemp -t x` trên macOS đẻ ra tệp tạm; GNU mktemp đòi đuôi XXXXXX. Viết đủ
# XXXXXX thì cả hai bên cùng hiểu.
tmp_file() { mktemp -t "${1:-nook}XXXXXX"; }

# Doc mot bien tu .env cua backend. Dung de bai kiem bam theo cau hinh THAT
# thay vi cam cung mot con so roi mot ngay nao do lech ma khong ai biet.
env_of() { grep -E "^$1=" "$BACKEND/.env" 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '
'; }
