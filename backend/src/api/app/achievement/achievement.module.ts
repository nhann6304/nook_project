import { Module } from '@nestjs/common';
import { AchievementController } from './controller/index.js';
import { AchievementService } from './service/index.js';
import { AchievementMapper } from './mapper/index.js';

@Module({
  controllers: [AchievementController],
  providers: [AchievementService, AchievementMapper],
  // Chặng 3: góc bạn bè và ký ức gọi `evaluate()` sau mỗi lần con đếm đổi.
  exports: [AchievementService],
})
export class AchievementModule {}
