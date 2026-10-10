import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE } from '../../queue/constant/index.js';
import { SearchService } from './search.service.js';
import { UserSearchProcessor } from './user-search.processor.js';
import { UserSearchService } from './user-search.service.js';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE.search })],
  providers: [SearchService, UserSearchService, UserSearchProcessor],
  exports: [SearchService, UserSearchService],
})
export class SearchModule {}
