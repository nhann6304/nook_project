import { Module } from '@nestjs/common';
import { UsernameController } from './username.controller.js';
import { UsernameService } from './username.service.js';

/** Tên riêng: kiểm còn trống, và đặt. Tách khỏi hồ sơ vì là việc khác. */
@Module({
  controllers: [UsernameController],
  providers: [UsernameService],
  exports: [UsernameService],
})
export class UsernameModule {}
