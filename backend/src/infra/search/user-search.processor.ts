import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { QUEUE, type IIndexUserJob } from '../../queue/constant/index.js';
import { UserSearchService } from './user-search.service.js';

/** Ném lỗi là BullMQ thử lại (3 lần, lùi dần — `QueueModule`). */
@Processor(QUEUE.search)
export class UserSearchProcessor extends WorkerHost {
  constructor(private readonly userSearch: UserSearchService) {
    super();
  }

  async process(job: Job<IIndexUserJob>): Promise<void> {
    if (job.name !== QUEUE.job.indexUser) return;
    await this.userSearch.sync(job.data.userId);
  }
}
