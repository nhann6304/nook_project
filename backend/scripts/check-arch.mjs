#!/usr/bin/env node
/**
 * Soi luật một chiều của cây thư mục.
 *
 *   core/  là KHUNG — không được biết một chữ nào về nghiệp vụ Nook.
 *   api/   là TÍNH NĂNG — dùng khung thoải mái.
 *
 * Không có bộ soi này thì luật chỉ nằm trong tài liệu, và tài liệu thì mục.
 * Một hôm nào đó có người cần "chỉ một thứ nhỏ thôi" từ `api/` sang `core/`,
 * và từ lúc đó khung không tách ra được nữa.
 *
 * Chạy: npm run check:arch
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = new URL('../src/', import.meta.url).pathname;

/** ai KHÔNG được nhập từ ai */
const RULES = [
  { from: 'core',       banned: ['apis/', 'realtime/', 'queue/'],        why: 'core la khung, khong duoc biet nghiep vu' },
  { from: 'database',   banned: ['apis/', 'core/service', 'realtime/'],  why: 'database chi lo ket noi va bang' },
  { from: 'infra',      banned: ['apis/', 'realtime/'],                  why: 'infra chi lo the gioi ben ngoai' },
  { from: 'repository', banned: ['apis/', 'realtime/'],                  why: 'kho du lieu khong thuoc ve khan gia nao' },
  { from: 'apis/app',   banned: ['apis/admin/'],                         why: 'cua app khong duoc voi sang cua quan tri' },
  { from: 'apis/admin', banned: ['apis/app/'],                           why: 'cua quan tri khong duoc voi sang cua app' },
];

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
  });

let bad = 0;
for (const rule of RULES) {
  const root = join(SRC, rule.from);
  let files = [];
  try { files = walk(root); } catch { continue; }

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
      const target = relative(SRC, join(file, '..', m[1])).replaceAll('\\', '/');
      const hit = rule.banned.find((b) => target.startsWith(b));
      if (hit) {
        console.error(`  x ${relative(SRC, file)}  ->  ${target}`);
        console.error(`    ${rule.from}/ khong duoc nhap tu ${hit}  (${rule.why})`);
        bad += 1;
      }
    }
  }
}

if (bad > 0) {
  console.error(`\n${bad} cho pha luat mot chieu cua cay thu muc.`);
  process.exit(1);
}
console.log('check:arch  ok - khung va tinh nang van tach roi');
