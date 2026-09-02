import { Module } from '@nestjs/common';
import { AchievementController } from './achievement.controller.js';
import { AchievementService } from './achievement.service.js';
import { AchievementMapper } from './achievement.mapper.js';

@Module({
  controllers: [AchievementController],
  providers: [AchievementService, AchievementMapper],
  // Chặng 3: góc bạn bè và ký ức gọi `evaluate()` sau mỗi lần con đếm đổi.
  exports: [AchievementService],
})
export class AchievementModule {}
