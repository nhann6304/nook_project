import { Module } from '@nestjs/common';
import { RealtimeModule } from '../../../realtime/index.js';
import { MediaModule } from '../media/index.js';
import { ChatController } from './chat.controller.js';
import { ChatGateway } from './chat.gateway.js';
import { ChatMapper } from './chat.mapper.js';
import { ChatService } from './chat.service.js';

/**
 * Chat 1-1 — tầng 2, ngang `circle` · `moment` · `memory`.
 *
 * Nhập `RealtimeModule` để BẮN tin (chiều tính năng → ống); ống thì không biết
 * chat tồn tại, chỉ phát vào/rời cho ai đăng ký nghe.
 */
@Module({
  imports: [MediaModule, RealtimeModule],
  controllers: [ChatController],
  providers: [ChatService, ChatMapper, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
