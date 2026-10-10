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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, '.env');
if (existsSync(target)) process.exit(0);

const fresh = () => randomBytes(48).toString('base64url');
const text = readFileSync(join(root, '.env.example'), 'utf8').replace(
  /^(JWT_ACCESS_SECRET|JWT_REFRESH_SECRET|AUTH_CODE_SECRET)=.*$/gm,
  (_, key) => `${key}=${fresh()}`,
);
writeFileSync(target, text);
console.log('backend/.env created from .env.example (fresh dev secrets)');
