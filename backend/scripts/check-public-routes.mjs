#!/usr/bin/env node
/**
 * Soi xem có ai vừa mo them mot cua cho nguoi CHUA DANG NHAP hay khong.
 *
 * Cong the gan toan cuc nen moi duong deu DONG san; `@Public()` la cach duy
 * nhat mo ra. Nhung "duy nhat" khong co nghia la "kho quen" — dan mot dong
 * `@Public()` mat mot giay, va khong ai o buoc duyet ma de y.
 *
 * Bo soi nay giu mot DANH SACH CHO PHEP. Them `@Public()` o cho khac la no do,
 * va nguoi them phai vao day khai ten — mot buoc nho, nhung la mot buoc CO Y.
 *
 * Chay: npm run check:public  (nam trong npm run check nen push cung chay)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = new URL('../src/', import.meta.url).pathname;

/**
 * Duong duoc phep mo. Moi dong phai co ly do dung mot cau.
 *
 * Them vao day nghia la ban dang noi: nguoi CHUA DANG NHAP goi duoc cua nay.
 * Neu khong chac thi dung them.
 */
const ALLOWED = new Map([
  ['apis/auth/auth.controller.ts', 4],   // 4 cua dang nhap: chua co the thi lay dau ra the
  ['apis/health/health.controller.ts', 1], // do song chet cho bo can bang tai
]);

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const full = join(dir, n);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
  });

let bad = 0;
const found = new Map();

for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8');
  // Chi dem cho DAN THAT, khong dem cho nhac toi trong chu thich.
  const uses = text.split('\n').filter((l) => /^\s*@Public\(\)\s*$/.test(l)).length;
  if (uses > 0) found.set(relative(SRC, file).replaceAll('\\', '/'), uses);
}

for (const [file, count] of found) {
  const allowed = ALLOWED.get(file);
  if (allowed === undefined) {
    console.error(`  x ${file}: co ${count} duong @Public() ma khong nam trong danh sach cho phep`);
    console.error(`    Neu that su muon mo cho nguoi chua dang nhap, khai vao ALLOWED trong scripts/check-public-routes.mjs`);
    bad += 1;
  } else if (count !== allowed) {
    console.error(`  x ${file}: co ${count} duong @Public(), danh sach ghi ${allowed}`);
    bad += 1;
  }
}
for (const [file, count] of ALLOWED) {
  if (!found.has(file)) {
    console.error(`  x ${file}: danh sach ghi ${count} duong @Public() nhung khong con cai nao — cap nhat lai danh sach`);
    bad += 1;
  }
}

if (bad > 0) {
  console.error(`\n${bad} cho lech giua ma nguon va danh sach duong mo.`);
  process.exit(1);
}

const total = [...found.values()].reduce((a, b) => a + b, 0);
console.log(`check:public  ok - ${total} duong mo, dung nhu khai bao`);
