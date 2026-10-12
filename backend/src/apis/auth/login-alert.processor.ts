import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { CodeSenderService } from '../../infra/notify/service/index.js';
import { AuthEventRepository, UserIdentityRepository } from '../../repository/index.js';
import { QUEUE, type ILoginAlertJob } from '../../queue/constant/index.js';

/**
 * Gửi thư "Có đăng nhập mới vào LOVO". Ném lỗi là BullMQ thử lại (3 lần).
 *
 * Một hàng đợi — một bộ xử lý: hàng `mail` chỉ được nghe ở ĐÂY. Bộ thứ hai
 * nghe cùng hàng sẽ nhận việc không phải của nó, bỏ qua, và việc mất luôn.
 */
@Processor(QUEUE.mail)
export class LoginAlertProcessor extends WorkerHost {
  private readonly log = new Logger('LoginAlert');

  constructor(
    private readonly events: AuthEventRepository,
    private readonly identities: UserIdentityRepository,
    private readonly sender: CodeSenderService,
  ) {
    super();
  }

  async process(job: Job<ILoginAlertJob>): Promise<void> {
    if (job.name !== QUEUE.job.loginAlert) return;

    const event = await this.events.findById(job.data.eventId);
    if (!event) return; // đã bị dọn

    // Chỉ báo qua email. Tài khoản chỉ có số điện thoại: SMS tốn tiền mỗi tin,
    // chưa báo — README mục 1.
    const email = await this.identities.findOne({ userId: event.userId, kind: 'email' });
    if (!email) {
      this.log.log(`no email identity, alert skipped user=${event.userId}`);
      return;
    }

    await this.sender.sendLoginAlert(email.value, {
      model: event.model,
      os: event.os,
      country: event.country,
      at: event.createdAt,
    });
  }
}
