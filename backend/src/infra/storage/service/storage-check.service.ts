import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env, NodeEnv } from '../../../config/env/index.js';
import { StorageService } from './storage.service.js';

/** Đường dò, ghi rồi xoá ngay. Không đụng vào ảnh của ai. */
const PROBE_KEY = '.nook-storage-check';

/**
 * Soi kho ảnh NGAY LÚC BẬT SERVER.
 *
 * Không có bước này thì cấu hình kho sai chỉ lộ ra ở **lần tải ảnh đầu tiên của
 * người dùng thật** — và lúc đó câu lỗi của S3 là `403 SignatureDoesNotMatch`
 * hoặc `404 NoSuchBucket`, không hé một chữ nào về việc khai sai khoá hay sai
 * tên thùng. Với một app mà ảnh là sản phẩm, đó là kiểu hỏng tệ nhất: im lặng
 * cho tới đúng lúc có người dùng.
 *
 * Ghi thật một tệp bé rồi xoá, chứ không chỉ hỏi thùng có tồn tại không — khoá
 * chỉ-đọc vẫn qua được câu hỏi đó, rồi tải lên mới hỏng.
 *
 * Bản thật thì hỏng là **chết luôn**: server không chứa được ảnh thì nó không
 * làm được việc của nó, bật lên chỉ để nhận lỗi thì thà đừng bật. Máy dev thì
 * chỉ kêu — để còn làm việc được lúc ngồi chỗ không có mạng.
 */
@Injectable()
export class StorageCheckService implements OnApplicationBootstrap {
  private readonly log = new Logger('StorageCheck');

  constructor(
    private readonly storage: StorageService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const isProd = this.config.get('NODE_ENV', { infer: true }) === NodeEnv.production;

    try {
      await this.storage.put(PROBE_KEY, Buffer.from('nook'), 'text/plain');
      const back = await this.storage.head(this.storage.current, PROBE_KEY);
      if (!back || back.byteSize !== 4) throw new Error('wrote the probe but could not read it back');
      await this.storage.remove(this.storage.current, PROBE_KEY);

      this.log.log(`storage ok: ${this.storage.current} (write + read + delete)`);
    } catch (error) {
      const why = error instanceof Error ? error.message : String(error);
      const message =
        `Storage is not usable (${this.storage.current}): ${why}\n` +
        `  Check STORAGE_ENDPOINT / STORAGE_BUCKET / STORAGE_KEY_ID / STORAGE_SECRET.\n` +
        `  For R2 the endpoint looks like https://<account-id>.r2.cloudflarestorage.com\n` +
        `  and the bucket must already exist.`;

      if (isProd) throw new Error(message);
      this.log.error(message, error instanceof Error ? error.stack : undefined);
    }
  }
}
