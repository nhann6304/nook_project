import { Module } from '@nestjs/common';
import { UserModule } from './user/index.js';
import { MediaModule } from './media/index.js';
import { AchievementModule } from './achievement/index.js';
import { SettingModule } from './setting/index.js';
import { ChatModule } from './chat/index.js';

/**
 * Cửa cho **app React Native**. Không phải cho web quản trị.
 *
 * Mọi đường ở đây nói chuyện với một người về CHÍNH HỌ và về vòng bạn bè của
 * họ. Không đường nào trả về dữ liệu của người thứ ba, không đường nào cần vai
 * quản trị.
 *
 * Chặng sau thêm vào đây: circle · moment · memory · push.
 */
@Module({
  imports: [UserModule, MediaModule, AchievementModule, SettingModule, ChatModule],
})
export class AppApiModule {}
