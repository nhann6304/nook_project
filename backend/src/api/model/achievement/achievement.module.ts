import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module.js';
import { AchievementController } from './achievement.controller.js';
import { AchievementService } from './achievement.service.js';
import { AchievementMapper } from './achievement.mapper.js';
import { AchievementRepository } from './achievement.repository.js';
import { UserAchievementRepository } from './user-achievement.repository.js';

@Module({
  // Con đếm thuộc về người dùng, nên kho của nó ở module `user`. Mượn, không chép.
  imports: [UserModule],
  controllers: [AchievementController],
  providers: [
    AchievementService,
    AchievementMapper,
    AchievementRepository,
    UserAchievementRepository,
  ],
  // Chặng 3: góc bạn bè và ký ức gọi `evaluate()` sau mỗi lần con đếm đổi.
  exports: [AchievementService],
})
export class AchievementModule {}
