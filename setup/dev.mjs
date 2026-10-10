#!/usr/bin/env node
/**
 * MỘT lệnh bật server dev, chạy được trên cả Mac lẫn Windows:
 *
 *     npm run dev
 *
 * Theo thứ tự: kiểm Docker → tự tạo backend/.env → bật Postgres + Redis + MinIO
 * trong Docker → chờ Postgres sẵn sàng → dịch @nook/shared → chạy migration →
 * bật server (tự nạp lại khi sửa code). Hỏng bước nào thì dừng và nói cách sửa.
 *
 * Chữ in ra KHÔNG DẤU có chủ ý: cmd của Windows mặc định không đọc UTF-8.
 */
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPOSE = join(ROOT, 'backend', 'docker', 'compose.dev.yml');
const ENV = join(ROOT, 'backend', '.env');
const WIN = process.platform === 'win32';
const NPM = WIN ? 'npm.cmd' : 'npm';

const say = (m) => console.log(`\n\x1b[1m> ${m}\x1b[0m`);
const ok = (m) => console.log(`  \x1b[32m[ok]\x1b[0m ${m}`);
function die(m) {
  console.error(`\n  \x1b[31m[LOI]\x1b[0m ${m}\n`);
  process.exit(1);
}
const run = (cmd, args, quiet = false) =>
  spawnSync(cmd, args, { cwd: ROOT, stdio: quiet ? 'pipe' : 'inherit', shell: WIN, encoding: 'utf8' });

/* 1 — Node + Docker */
say('Kiem tra may');
const major = Number(process.versions.node.split('.')[0]);
if (major < 20) die(`Node ${process.versions.node} qua cu. Cai Node 22 hoac 24 tu https://nodejs.org`);
ok(`Node ${process.versions.node}`);
if (run('docker', ['info'], true).status !== 0) {
  die('Docker chua chay. Mo Docker Desktop, doi bieu tuong ca voi dung yen, roi chay lai: npm run dev');
}
ok('Docker dang chay');
if (!existsSync(join(ROOT, 'node_modules'))) {
  say('Cai thu vien (lan dau)');
  if (run(NPM, ['install']).status !== 0) die('npm install hong. Xem loi phia tren.');
}

/* 2 — backend/.env */
say('File cau hinh backend/.env');
run('node', [join(ROOT, 'backend', 'scripts', 'ensure-env.mjs')]);
const env = Object.fromEntries(
  readFileSync(ENV, 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
if (env.DB_PORT !== '5433') {
  console.log(
    `  [!] DB_PORT=${env.DB_PORT} — dang tro toi Postgres CAI TREN MAY, khong phai Docker.\n` +
      '      Muon dung Docker: xoa backend/.env roi chay lai lenh nay.',
  );
} else ok('DB_PORT=5433 (Postgres trong Docker)');

/* 3 — Docker: Postgres + Redis + MinIO */
say('Bat Postgres + Redis + MinIO (Docker)');
const up = run('docker', ['compose', '-f', COMPOSE, 'up', '-d']);
if (up.status !== 0) {
  die(
    'docker compose hong. Hay gap nhat:\n' +
      '    - Cong 5433 / 6380 / 9000 / 9001 dang bi chiem: tat ung dung dang dung cong do.\n' +
      '    - Mang cham khi tai image lan dau: chay lai lenh nay.\n' +
      '    - Container cu cung ten: docker rm -f nook-db nook-redis nook-minio nook-minio-init',
  );
}

/* 4 — Chờ Postgres */
if (env.DB_PORT === '5433') {
  process.stdout.write('  Cho Postgres');
  let healthy = false;
  for (let i = 0; i < 60 && !healthy; i++) {
    const r = run('docker', ['inspect', '-f', '{{.State.Health.Status}}', 'nook-db'], true);
    healthy = r.stdout?.trim() === 'healthy';
    if (!healthy) {
      process.stdout.write('.');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }
  }
  console.log('');
  if (!healthy) die('Postgres khong len sau 60 giay. Xem: docker logs nook-db');
  ok('Postgres localhost:5433 · Redis localhost:6380 · MinIO localhost:9000');
}

/* 5 — shared + migration */
say('Dich @nook/shared + chay migration');
if (run(NPM, ['run', 'build:shared'], true).status !== 0) die('Dich @nook/shared hong. Chay: npm run build:shared');
if (run(NPM, ['run', 'migration:run']).status !== 0) {
  die('Migration hong — thuong la sai mat khau / sai cong database trong backend/.env.');
}
ok('Database da san sang');

/* 6 — Server */
say('Bat server — http://localhost:4000 · Swagger http://localhost:4000/api/v1/docs');
console.log('  Ma dang nhap (email / so dien thoai) in ngay trong cua so nay. Ctrl+C de tat.');
console.log('  App: mo cua so khac, chay  npm run dev:fe  roi quet QR bang Expo Go.\n');
const server = spawn(NPM, ['run', 'dev:be'], { cwd: ROOT, stdio: 'inherit', shell: WIN });
server.on('exit', (code) => process.exit(code ?? 0));
