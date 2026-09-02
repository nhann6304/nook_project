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
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// `new URL().pathname` tra ve `/D:/...` tren Windows -> scandir hong. `fileURLToPath`
// tra ve duong dan that cua tung he. Truoc khi sua, bo soi nay im lang bo qua sach.
const SRC = fileURLToPath(new URL('../src/', import.meta.url));

/** ai KHÔNG được nhập từ ai */
const RULES = [
  { from: 'core',       banned: ['apis/', 'realtime/', 'queue/'],        why: 'core la khung, khong duoc biet nghiep vu' },
  { from: 'database',   banned: ['apis/', 'core/service', 'realtime/'],  why: 'database chi lo ket noi va bang' },
  { from: 'infra',      banned: ['apis/', 'realtime/'],                  why: 'infra chi lo the gioi ben ngoai' },
  { from: 'repository', banned: ['apis/', 'realtime/'],                  why: 'kho du lieu khong thuoc ve khan gia nao' },
  { from: 'apis/app',   banned: ['apis/admin/'],                         why: 'cua app khong duoc voi sang cua quan tri' },
  { from: 'apis/admin', banned: ['apis/app/'],                           why: 'cua quan tri khong duoc voi sang cua app' },
];

/**
 * TANG cua tinh nang trong `apis/app/`. Import chi duoc di XUONG so nho hon.
 *
 * Cung tang thi CAM, va do la cho dat gia cua luat nay: hai tinh nang ngang
 * hang can goi nhau co nghia la mot trong hai chuyen sai cho. Ba loi thoat,
 * theo thu tu nen thu:
 *   1. no von la MOT viec -> gop lai (username tung la thu muc rieng, gio nam
 *      trong `user/` vi no la hai cot cua bang `users`)
 *   2. cai chung la cau truy van -> ha xuong `repository/`
 *   3. cai chung la mot su kien -> ben duoi PHAT, ben tren NGHE
 *
 * Them tinh nang moi thi phai khai o day. Mot buoc nho, nhung la mot buoc CO Y:
 * khong khai duoc no o tang nao la dau hieu chua biet no la viec gi.
 */
const APP_LAYERS = new Map([
  ['media', 0],        // bytes va giay phep. Khong biet ai dang dung.
  ['user', 1],         // ho so + ten rieng. Dung media de dat anh dai dien.
  ['setting', 1],      // cai dat cua nguoi dung
  ['circle', 2],       // goc 10 nguoi ban
  ['moment', 2],       // khoanh khac gui vao goc
  ['thread', 2],       // tra loi mot khoanh khac
  ['memory', 2],       // ky uc - don vi duy nhat cua he tien trinh
  ['achievement', 3],  // PHAI SINH: doc ket qua tang 2, khong ai goi thang
  ['notification', 3], // PHAI SINH: nghe su kien roi day di
]);

/** Tinh nang nao dang o `apis/app/` ma chua ai khai tang. */
const undeclared = new Set();

/** `apis/app/<ten-tinh-nang>/...` -> ten tinh nang */
const RE_FEATURE = /^apis\/app\/([^/]+)\//;

const checkAppLayers = (file, target) => {
  const from = relative(SRC, file).replaceAll('\\', '/').match(RE_FEATURE)?.[1];
  const to = target.match(RE_FEATURE)?.[1];
  if (!from || !to || from === to) return 0;

  for (const name of [from, to]) {
    if (!APP_LAYERS.has(name)) { undeclared.add(name); return 0; }
  }

  const a = APP_LAYERS.get(from);
  const b = APP_LAYERS.get(to);
  if (b < a) return 0;

  console.error(`  x apis/app/${from}  ->  apis/app/${to}`);
  console.error(
    b === a
      ? `    cung tang ${a}: gop lai, ha xuong repository/, hoac dung su kien`
      : `    tang ${a} khong duoc goi len tang ${b}: import chi di xuong`,
  );
  return 1;
};

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
  });

let bad = 0;
for (const rule of RULES) {
  const root = join(SRC, rule.from);
  // Nuot loi o day tung lam bo soi chet cam: duong dan sai thi no bo qua sach
  // ma van in "ok". Chi bo qua khi thu muc that su khong ton tai.
  if (!existsSync(root)) continue;
  const files = walk(root);

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
      const target = relative(SRC, join(file, '..', m[1])).replaceAll('\\', '/');
      if (rule.from === 'apis/app') bad += checkAppLayers(file, target);

      const hit = rule.banned.find((b) => target.startsWith(b));
      if (hit) {
        console.error(`  x ${relative(SRC, file)}  ->  ${target}`);
        console.error(`    ${rule.from}/ khong duoc nhap tu ${hit}  (${rule.why})`);
        bad += 1;
      }
    }
  }
}

if (undeclared.size > 0) {
  console.error(`  x chua khai tang cho: ${[...undeclared].join(', ')}`);
  console.error('    them vao APP_LAYERS trong scripts/check-arch.mjs');
  bad += undeclared.size;
}

if (bad > 0) {
  console.error(`\n${bad} cho pha luat mot chieu cua cay thu muc.`);
  process.exit(1);
}
console.log(`check:arch  ok - khung tach roi, ${APP_LAYERS.size} tang cua apis/app dung chieu`);
