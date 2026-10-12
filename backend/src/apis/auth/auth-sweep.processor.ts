import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, type OnModuleInit } from '@nestjs/common';
import type { Job, Queue } from 'bullmq';
import { AuthEventRepository } from '../../repository/index.js';
import { QUEUE } from '../../queue/constant/index.js';

/** Sổ đăng nhập giữ ngần này ngày rồi xoá. */
const AUTH_EVENT_RETENTION_DAYS = 180;
const DAY_MS = 86_400_000;

/** Mỗi ngày 03:17 UTC. Phút lẻ để không dồn vào :00 cùng mọi việc định kỳ khác. */
const PURGE_SCHEDULE = { id: 'auth-events-purge', pattern: '17 3 * * *' } as const;

/**
 * Dọn sổ đăng nhập. Lịch nằm trong Redis (job scheduler của BullMQ), nên chạy
 * mấy bản server cũng chỉ MỘT lần mỗi ngày — `setInterval` thì mỗi bản một lần.
 *
 * Một hàng đợi — một bộ xử lý: hàng `sweep` chỉ được nghe ở ĐÂY. Thêm việc dọn
 * khác thì thêm nhánh `job.name` vào đây, đừng mở bộ xử lý thứ hai.
 */
@Processor(QUEUE.sweep)
export class AuthSweepProcessor extends WorkerHost implements OnModuleInit {
  private readonly log = new Logger('AuthSweep');

  constructor(
    private readonly events: AuthEventRepository,
    @InjectQueue(QUEUE.sweep) private readonly queue: Queue,
  ) {
    super();
  }

  onModuleInit(): void {
    // Không chờ: Redis chập lúc bật thì chỉ mất lịch tới lần bật sau, server vẫn lên.
    this.queue
      .upsertJobScheduler(
        PURGE_SCHEDULE.id,
        { pattern: PURGE_SCHEDULE.pattern },
        {
          name: QUEUE.job.purgeAuthEvents,
        },
      )
      .catch((e: unknown) => this.log.warn(`purge schedule not set: ${String(e)}`));
  }

  async process(job: Job): Promise<void> {
    if (job.name !== QUEUE.job.purgeAuthEvents) return;
    const cutoff = new Date(Date.now() - AUTH_EVENT_RETENTION_DAYS * DAY_MS);
    const removed = await this.events.purgeBefore(cutoff);
    this.log.log(`purged ${removed} auth events older than ${AUTH_EVENT_RETENTION_DAYS} days`);
  }
}
