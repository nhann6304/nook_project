import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE } from '../../../queue/index.js';
import { MediaController } from './controller/index.js';
import { MediaService } from './service/index.js';
import { MediaMapper } from './mapper/index.js';
import { MediaProcessor } from './processor/index.js';

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
