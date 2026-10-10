#!/usr/bin/env node
/**
 * Chưa có `frontend/.env` thì dựng một tệp trỏ `EXPO_PUBLIC_API_URL=auto`:
 * app tự hỏi Expo máy tính đang chạy Metro ở IP nào rồi gọi server cổng 4000
 * trên chính máy đó (`src/lib/http/api.ts`). Đổi Wi-Fi không phải sửa gì.
 *
 * Có rồi thì không đụng. Muốn chạy hàng giả: để trống dòng đó.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const target = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (existsSync(target)) process.exit(0);

writeFileSync(
  target,
  [
    '# Dựng tự động bởi scripts/ensure-env.mjs — xem .env.example.',
    '# auto = server cổng 4000 trên chính máy đang chạy Metro. Để trống = hàng giả.',
    'EXPO_PUBLIC_API_URL=auto',
    '',
  ].join('\n'),
);
console.log('frontend/.env created (EXPO_PUBLIC_API_URL=auto)');
