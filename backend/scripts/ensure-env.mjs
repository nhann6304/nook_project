#!/usr/bin/env node
/**
 * Chưa có `backend/.env` thì dựng từ `.env.example`, thay ba chuỗi ký dev bằng
 * chuỗi ngẫu nhiên. Có rồi thì KHÔNG đụng vào — chuỗi ký đổi là mọi phiên
 * đăng nhập cũ chết.
 *
 * Vì sao không commit `.env`: nó sẽ có key thật (SMS, SMTP) và đẩy lên là lộ.
 * Tự dựng ở đây cho cùng một trải nghiệm "kéo về là chạy".
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { networkInterfaces } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, '.env');
if (existsSync(target)) process.exit(0);

/**
 * IP LAN của máy. Đường tải ảnh lên được KÝ theo STORAGE_ENDPOINT, và điện
 * thoại không tới được `localhost` của máy tính — nên điền IP thật vào đây.
 */
function lanIp() {
  const all = Object.values(networkInterfaces())
    .flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal)
    .map((a) => a.address);
  // Wi-Fi nhà thường là 192.168.x; 172.x hay là card ảo của Docker/WSL.
  const rank = (ip) => (ip.startsWith('192.168.') ? 0 : ip.startsWith('10.') ? 1 : 2);
  return all.sort((a, b) => rank(a) - rank(b))[0] ?? 'localhost';
}

const fresh = () => randomBytes(48).toString('base64url');
const ip = lanIp();
const text = readFileSync(join(root, '.env.example'), 'utf8')
  .replace(
    /^(JWT_ACCESS_SECRET|JWT_REFRESH_SECRET|AUTH_CODE_SECRET)=.*$/gm,
    (_, key) => `${key}=${fresh()}`,
  )
  .replace(/^STORAGE_ENDPOINT=.*$/m, `STORAGE_ENDPOINT=http://${ip}:9000`);
writeFileSync(target, text);
console.log(`backend/.env created from .env.example (fresh dev secrets, storage at ${ip}:9000)`);
