import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import sharp from 'sharp';
import { MEDIA_STATUS, VARIANT_FORMAT, VARIANT_SPEC, type TMediaVariant } from '@nook/shared';
import { StorageService } from '../../../infra/storage/service/storage.service.js';
import { MediaRepository, MediaVariantRepository } from '../../../repository/index.js';
import { QUEUE, type IBuildVariantsJob } from '../../../queue/constant/queue.constant.js';

/**
 * Dựng bản nhẹ từ bản gốc — chạy ở VIỆC NỀN.
 *
 * ── Vì sao ở việc nền chứ không dựng ngay lúc tải xong ──────────────────────
 *
 * Kéo 12MB về bộ nhớ rồi nén lại mất vài trăm mili giây và chiếm một luồng.
 * Node chỉ có một luồng cho JavaScript — làm việc đó trong đường request là
 * chặn MỌI request khác đang chờ. Ở việc nền thì không ai đứng đợi, và ảnh vẫn
 * dùng được ngay bằng bản gốc.
 *
 * Đây cũng là **chỗ duy nhất trong cả server bytes ảnh đi qua Node**. Đường của
 * người dùng chỉ ký giấy phép; app tải thẳng lên kho.
 *
 * ── Bản gốc không bị đụng tới ───────────────────────────────────────────────
 *
 * Đọc ra, dựng bản mới, ghi bản mới vào đường khác. Không có `remove`, không có
 * ghi đè. Dựng hỏng thì mất bản nhẹ, không mất gì khác.
 *
 * `.rotate()` không tham số là **áp dụng hướng xoay ghi trong EXIF**. Thiếu nó
 * thì ảnh chụp dọc bằng điện thoại ra bản nhẹ nằm ngang — bản gốc vẫn đúng vì
 * nó còn EXIF, nhưng bản nhẹ thì đã mất thẻ đó.
 */
@Processor(QUEUE.media)
export class MediaProcessor extends WorkerHost {
  private readonly log = new Logger('MediaWorker');

  constructor(
    private readonly media: MediaRepository,
    private readonly variants: MediaVariantRepository,
    private readonly storage: StorageService,
  ) {
    super();
  }

  async process(job: Job<IBuildVariantsJob>): Promise<void> {
    if (job.name !== QUEUE.job.buildVariants) return;

    const row = await this.media.findById(job.data.mediaId);
    if (!row || row.status !== 'ready') {
      this.log.warn(`media not ready, skipping: ${job.data.mediaId}`);
      return;
    }

    const original = await this.storage.getBuffer(row.storageProvider, row.storageKey);

    for (const [name, spec] of Object.entries(VARIANT_SPEC) as [
      TMediaVariant,
      { width: number; quality: number },
    ][]) {
      const existing = await this.variants.findOneOf(row.id, name);
      if (existing?.status === MEDIA_STATUS.READY) continue;

      try {
        const out = await sharp(original, { failOn: 'none' })
          .rotate()
          // `withoutEnlargement`: ảnh vốn nhỏ hơn thì để yên. Phóng to lên chỉ
          // làm tệp nặng thêm mà không nét thêm một chút nào.
          .resize({ width: spec.width, withoutEnlargement: true })
          .webp({ quality: spec.quality })
          .toBuffer({ resolveWithObject: true });

        const key = `${name}/${row.ownerId}/${row.id}.webp`;
        await this.storage.put(key, out.data, VARIANT_FORMAT);

        const record = {
          mediaId: row.id,
          variant: name,
          status: 'ready' as const,
          storageKey: key,
          storageProvider: this.storage.current,
          contentType: VARIANT_FORMAT,
          byteSize: out.info.size,
          width: out.info.width,
          height: out.info.height,
        };

        if (existing) await this.variants.save(Object.assign(existing, record));
        else await this.variants.create(record);

        this.log.debug(
          `${name} built for media ${row.id}: ${row.byteSize} -> ${out.info.size} bytes`,
        );
      } catch (error) {
        this.log.error(
          `${name} failed for media ${row.id}: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
        // Ghi lại là hỏng, KHÔNG ném tiếp: một bản hỏng không nên kéo theo bản
        // kia, và bản gốc thì vẫn dùng được bình thường.
        if (existing) {
          await this.variants.update({ id: existing.id }, { status: 'failed' });
        }
      }
    }
  }
}
