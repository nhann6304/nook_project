import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE } from '../../../queue/index.js';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';
import { MediaMapper } from './media.mapper.js';
import { MediaProcessor } from './media.processor.js';

/**
 * Ảnh: ba cửa cho app, một việc nền dựng bản nhẹ.
 *
 * Việc nền chạy CHUNG tiến trình với API ở chặng này. Ổn khi lượng ảnh còn ít.
 * Ngày nó tranh luồng với đường request thì tách ra tiến trình riêng — chỉ cần
 * một `main.worker.ts` nạp đúng module này mà không nạp controller.
 */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE.media })],
  controllers: [MediaController],
  providers: [MediaService, MediaMapper, MediaProcessor],
  exports: [MediaService, MediaMapper],
})
export class MediaModule {}
