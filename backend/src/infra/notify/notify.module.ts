import { Global, Module } from '@nestjs/common';
import { CodeSenderService } from './service/index.js';
import { ConsoleSender, EsmsSender, SmtpSender, TwilioSender } from './sender/index.js';

@Global()
@Module({
  providers: [ConsoleSender, SmtpSender, EsmsSender, TwilioSender, CodeSenderService],
  exports: [CodeSenderService],
})
export class NotifyModule {}
