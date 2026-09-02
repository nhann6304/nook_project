import { Module } from '@nestjs/common';
import { MediaController } from './controller/index.js';
import { MediaService } from './service/index.js';
import { MediaMapper } from './mapper/index.js';

@Module({
  controllers: [MediaController],
  providers: [MediaService, MediaMapper],
  // Hồ sơ cần để đặt ảnh đại diện; chặng sau khoảnh khắc cũng cần.
  exports: [MediaService, MediaMapper],
})
export class MediaModule {}
