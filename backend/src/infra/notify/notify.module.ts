import { Global, Module } from '@nestjs/common';
import { CodeSenderService } from './service/index.js';
import { ConsoleSender, SmtpSender } from './sender/index.js';

@Global()
@Module({
  providers: [ConsoleSender, SmtpSender, CodeSenderService],
  exports: [CodeSenderService],
})
export class NotifyModule {}
