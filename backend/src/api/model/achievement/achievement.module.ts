import { Module } from '@nestjs/common';
import { UserModule } from '../user/index.js';
import { AchievementController } from './controller/index.js';
import { AchievementService } from './service/index.js';
import { AchievementMapper } from './mapper/index.js';
import { AchievementRepository, UserAchievementRepository } from './repository/index.js';

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
