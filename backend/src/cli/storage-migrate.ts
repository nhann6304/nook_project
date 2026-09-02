/**
 * Chép ảnh từ kho CŨ sang kho ĐANG DÙNG.
 *
 *   npm run storage:migrate -- --dry-run     xem sẽ chép những gì
 *   npm run storage:migrate                  chép thật
 *   npm run storage:migrate -- --limit 100   chép từng mẻ
 *
 * Cách dùng, theo thứ tự:
 *   1. Trỏ `STORAGE_*` sang kho MỚI
 *   2. Khai `STORAGE_LEGACY_*` trỏ về kho CŨ
 *   3. Bật server — ảnh mới vào kho mới, ảnh cũ vẫn đọc được ở kho cũ
 *   4. Chạy lệnh này lúc rảnh, chép dần
 *   5. Chép xong thì bỏ khối `STORAGE_LEGACY_*` đi
 *
 * **Không dừng dịch vụ, không mất tấm nào.** Chạy lại được nhiều lần: nó chỉ
 * nhặt dòng nào còn ghi kho cũ, nên đứt giữa chừng thì chạy tiếp là xong.
 *
 * Chép xong mới đổi cột `storage_provider`. Đảo thứ tự là có một khoảng dòng
 * nói "tôi ở kho mới" trong khi tệp còn ở kho cũ — và trong khoảng đó ảnh không
 * xem được.
 *
 * KHÔNG xoá bản ở kho cũ. Xoá là việc riêng, làm sau khi đã yên tâm.
 */
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module.js';
import { StorageService } from '../infra/storage/index.js';
import { MediaRepository, MediaVariantRepository } from '../repository/index.js';

const log = new Logger('StorageMigrate');

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const limit = Number(arg('limit') ?? 500);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const storage = app.get(StorageService);
  const media = app.get(MediaRepository);
  const variants = app.get(MediaVariantRepository);
  const target = storage.current;

  log.log(`target storage: ${target}${dryRun ? '  (dry run)' : ''}`);

  let moved = 0;
  let failed = 0;

  for (const [label, repo] of [
    ['media', media],
    ['media_variants', variants],
  ] as const) {
    // Chỉ nhặt dòng còn ghi kho cũ. Nhờ vậy chạy lại được, đứt giữa chừng cũng
    // chỉ mất công chép lại đúng tấm đang dở.
    const rows = await repo.find({ take: limit });
    const stale = rows.filter((r) => r.storageProvider !== target);
    log.log(`${label}: ${stale.length} object(s) still on an old storage`);

    for (const row of stale) {
      if (dryRun) {
        log.log(`  would copy ${row.storageProvider} -> ${target}  ${row.storageKey}`);
        moved += 1;
        continue;
      }
      try {
        const bytes = await storage.getBuffer(row.storageProvider, row.storageKey);
        await storage.put(row.storageKey, bytes, row.contentType);
        // Đổi cột SAU khi tệp đã nằm ở kho mới. Đảo lại là có một khoảng ảnh
        // không xem được.
        await repo.update({ id: row.id }, { storageProvider: target });
        moved += 1;
        log.log(`  copied ${row.storageKey} (${bytes.length} bytes)`);
      } catch (error) {
        failed += 1;
        log.error(
          `  FAILED ${row.storageKey}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  log.log(`done: ${moved} copied, ${failed} failed`);
  if (!dryRun && failed === 0 && moved > 0) {
    log.log('old objects were NOT deleted — remove them yourself once you are sure');
  }

  await app.close();
  process.exit(failed > 0 ? 1 : 0);
}

void main();
