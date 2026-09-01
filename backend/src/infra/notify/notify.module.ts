import { Global, Module } from '@nestjs/common';
import { CodeSenderService } from './code-sender.service.js';
import { ConsoleSender } from './console.sender.js';
import { SmtpSender } from './smtp.sender.js';

@Global()
@Module({
  providers: [ConsoleSender, SmtpSender, CodeSenderService],
  exports: [CodeSenderService],
})
export class NotifyModule {}
