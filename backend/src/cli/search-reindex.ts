/**
 * Dựng lại chỉ mục tìm kiếm từ Postgres.
 *
 *   npm run search:reindex -w @nook/backend                 chép hết, ghi đè từng người
 *   npm run search:reindex -w @nook/backend -- --recreate   xoá chỉ mục rồi dựng mới (đổi mapping)
 *
 * Chạy được nhiều lần. Dùng khi: mới bật `SEARCH_ENABLED`, ES mất dữ liệu,
 * hoặc nghi chỉ mục lệch với Postgres — Postgres luôn thắng.
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module.js';
import { UserSearchService } from '../infra/search/index.js';

const log = new Logger('SearchReindex');

async function main(): Promise<void> {
  const recreate = process.argv.includes('--recreate');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  let code = 0;
  try {
    const total = await app.get(UserSearchService).reindex(recreate);
    log.log(`done: ${total} users indexed${recreate ? ' (index recreated)' : ''}`);
  } catch (error) {
    log.error(`reindex failed: ${error instanceof Error ? error.message : String(error)}`);
    code = 1;
  }

  await app.close();
  process.exit(code);
}

void main();
