#!/usr/bin/env node
/**
 * Cho điện thoại gọi server dev mà KHÔNG phải đụng tường lửa / Wi-Fi:
 *
 *     npm run tunnel        (server phải đang chạy: npm run dev:be)
 *
 * Mở một "quick tunnel" của Cloudflare (miễn phí, không cần tài khoản) tới
 * localhost:4000, lấy link https://….trycloudflare.com rồi GHI vào
 * frontend/.env. Điện thoại đi qua Internet nên không cần chung mạng.
 *
 * Link đổi mỗi lần chạy — chạy lại lệnh này thì chạy lại `npm run dev:clear`
 * bên frontend. Chỉ dùng khi dev: ai có link là gọi được server máy bạn.
 * Chữ in ra KHÔNG DẤU: cmd của Windows mặc định không đọc UTF-8.
 */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FE_ENV = join(ROOT, 'frontend', '.env');
const PORT = 4000;
const CLOUDFLARED = 'cloudflared@0.7.3';
const WIN = process.platform === 'win32';

console.log(`\n> Mo duong ham toi http://localhost:${PORT} (lan dau tai cloudflared, hoi lau)...`);
const child = spawn(
  WIN ? 'npx.cmd' : 'npx',
  ['-y', CLOUDFLARED, 'tunnel', '--url', `http://localhost:${PORT}`, '--no-autoupdate'],
  { cwd: ROOT, shell: WIN },
);

let found = false;
const watch = (buf) => {
  const text = buf.toString();
  const m = text.match(/https:\/\/(?!api\.)[a-z0-9]+(?:-[a-z0-9]+)+\.trycloudflare\.com/);
  if (!found && m) {
    found = true;
    writeFileSync(
      FE_ENV,
      [
        '# Ghi boi `npm run tunnel` — link doi moi lan chay. Xoa dong duoi = hang gia.',
        `EXPO_PUBLIC_API_URL=${m[0]}`,
        '',
      ].join('\n'),
    );
    console.log(`\n  [ok] Server: ${m[0]}`);
    console.log(`  [ok] Da ghi vao frontend/.env`);
    console.log('\n  Tiep theo (cua so khac):  cd frontend && npm run dev:clear');
    console.log(`  Thu tren dien thoai:      ${m[0]}/api/v1/docs`);
    console.log('  Giu cua so nay mo. Ctrl+C de dong duong ham.\n');
  }
  if (/error|failed/i.test(text) && !found) process.stderr.write(text);
};
child.stdout.on('data', watch);
child.stderr.on('data', watch);
child.on('exit', (code) => {
  if (!found) console.error('\n  [LOI] Khong mo duoc duong ham. Kiem tra Internet roi chay lai.\n');
  process.exit(code ?? 1);
});
process.on('SIGINT', () => child.kill('SIGINT'));
