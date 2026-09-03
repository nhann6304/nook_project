#!/usr/bin/env node
/**
 * Soi cay `shared/src`.  TANG o ngoai, LOAI o giua, MIEN o trong.
 *
 *   common/<loai>/<mien>/   khong thuoc bang nao — xoa sach Nook di van con nghia
 *   model/<loai>/<mien>/    nghiep vu Nook
 *
 * Khong co bo soi nay thi luat chi nam trong tai lieu, va tai lieu thi muc.
 * Truoc khi co no, `common/.../envelope.interface.ts` da lo nhap nguoc len
 * `catalog` — mot vong tron ma khong ai thay.
 *
 * Sau thu no soi:
 *   1. common/ khong duoc nhap tu model/
 *   2. src/ chi co dung hai tang: common/ va model/
 *   3. moi tang chi co dung bon loai: constant/ interface/ type/ util/
 *   4. cung loai thi nhap THANG tep; doi loai thi phai qua index.js cua loai
 *   5. ten tep phai khop loai: duoi interface/ thi phai la *.interface.ts
 *   6. `dependencies` phai RONG — day la chan chan that cua luat "util/ chi
 *      chua ham dung chung, bai toan that thi backend tu code". Khong co thu
 *      vien thi khong ai viet duoc bo kiem email that o day ke ca muon.
 *
 * Chay: npm run check:layer  (da nam trong `npm run typecheck`)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// `new URL().pathname` tra ve `/D:/...` tren Windows -> scandir hong.
const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const LAYERS = ['common', 'model'];
const KINDS = ['constant', 'interface', 'type', 'util'];

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
  });

const posix = (p) => relative(SRC, p).replaceAll('\\', '/');
const subdirs = (p) => readdirSync(p).filter((n) => statSync(join(p, n)).isDirectory());

let bad = 0;
const fail = (...lines) => { for (const l of lines) console.error(l); bad += 1; };

// ── 6. goi nay khong duoc co phu thuoc ──────────────────────────────────────
// No bi nhet vao ban app tren dien thoai. Va no la chan chan cua luat: `util/`
// ben nay chi soi HINH DANG (dung/sai kieu `looksLikeEmail`), bo kiem THAT thi
// backend tu viet bang thu vien cua no. Cho phep mot phu thuoc o day la mo
// duong cho nghiep vu that boi sang gói nay.
{
  const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const deps = Object.keys(pkg.dependencies ?? {});
  if (deps.length > 0) {
    fail(
      `  x shared/package.json co ${deps.length} phu thuoc: ${deps.join(', ')}`,
      '    `dependencies` phai RONG — goi nay di vao ban app tren dien thoai,',
      '    va no la chan chan cua luat "bai toan that thi backend tu code".',
    );
  }
}

/**
 * 'model/interface/auth/auth.interface.ts' -> 'interface'.
 *
 * Tra null cho barrel (`<tang>/<loai>/index.ts`) va cho tep nam sai cho — mot
 * tep THAT phai la `<tang>/<loai>/<mien>/<ten>.ts`, du bon doan.
 */
const kindOf = (p) => {
  const [layer, kind, ...rest] = p.split('/');
  if (!LAYERS.includes(layer) || !KINDS.includes(kind)) return null;
  return rest.length >= 2 ? kind : null;
};

// ── 2 + 3. hai tang, bon loai ───────────────────────────────────────────────
for (const name of subdirs(SRC)) {
  if (!LAYERS.includes(name)) {
    fail(
      `  x src/${name}/  nam ngoai hai tang`,
      '    Hoi: xoa sach nghiep vu Nook di thi no con nghia khong?',
      '    Con -> common/, het -> model/. Roi moi hoi no la loai gi.',
    );
  }
}
for (const layer of LAYERS) {
  const root = join(SRC, layer);
  if (!existsSync(root)) { fail(`  x thieu src/${layer}/`); continue; }

  const barrel = readFileSync(join(root, 'index.ts'), 'utf8');
  for (const name of subdirs(root)) {
    if (!KINDS.includes(name)) {
      fail(
        `  x ${layer}/${name}/  khong phai mot LOAI`,
        `    ngoai cung cua mot tang chi co: ${KINDS.join(' · ')}`,
        `    "${name}" nghe nhu mot MIEN -> no thuoc vao ${layer}/<loai>/${name}/`,
      );
    } else if (!barrel.includes(`./${name}/index.js`)) {
      fail(`  x ${layer}/${name}/  chua duoc ${layer}/index.ts xuat`);
    }
  }
}

for (const file of walk(SRC)) {
  const from = posix(file);
  const kind = kindOf(from);

  // ── 3b. tep phai nam trong mot thu muc MIEN, khong tha thang vao loai ─────
  const parts = from.split('/');
  if (
    LAYERS.includes(parts[0]) && KINDS.includes(parts[1]) &&
    parts.length === 3 && parts[2] !== 'index.ts'
  ) {
    fail(
      `  x ${from}  tha thang vao ${parts[1]}/`,
      `    phai nam trong mot thu muc mien: ${parts[0]}/${parts[1]}/<mien>/${parts[2]}`,
    );
  }

  // ── 5. ten tep phai noi ra loai cua no ────────────────────────────────────
  if (kind && !basename(from).endsWith(`.${kind}.ts`)) {
    fail(
      `  x ${from}  nam duoi ${kind}/ ma khong ten *.${kind}.ts`,
      '    ten tep phai noi ra loai — nhin tab trong editor la biet, khong phai mo ra xem',
    );
  }

  // ── 4. moi tep phai duoc barrel cua loai no xuat ──────────────────────────
  if (kind) {
    const layer = from.split('/')[0];
    const barrel = readFileSync(join(SRC, layer, kind, 'index.ts'), 'utf8');
    const rel = from.slice(`${layer}/${kind}/`.length).replace(/\.ts$/, '.js');
    if (!barrel.includes(`./${rel}`)) {
      fail(
        `  x ${from}  chua duoc ${layer}/${kind}/index.ts xuat`,
        `    them dong: export * from './${rel}';`,
      );
    }
  }

  // ── 1 + 4. chieu nhap ─────────────────────────────────────────────────────
  for (const m of readFileSync(file, 'utf8').matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    const to = posix(resolve(dirname(file), m[1]));

    if (from.startsWith('common/') && to.startsWith('model/')) {
      fail(`  x ${from}  ->  ${to}`, '    common/ la tang duoi, khong duoc nhap tu model/');
      continue;
    }
    if (!kind) continue;

    const toKind = to.split('/')[1];
    const isBarrel = to.endsWith('/index.js');

    if (toKind === kind && isBarrel) {
      fail(
        `  x ${from}  ->  ${to}`,
        `    cung loai thi nhap THANG tep. Di qua ${kind}/index.js la tu nhap vao`,
        '    chinh minh — vong tron, va hang so ben kia co the chua co gia tri.',
      );
    } else if (toKind !== kind && !isBarrel) {
      fail(
        `  x ${from}  ->  ${to}`,
        `    doi loai thi phai qua index.js cua loai do, dung voi thang vao tep`,
      );
    }
  }
}

if (bad > 0) {
  console.error(`\n${bad} cho pha luat cua shared/src.`);
  process.exit(1);
}
console.log(`check:layer  ok - ${LAYERS.length} tang x ${KINDS.length} loai, chieu nhap dung`);
