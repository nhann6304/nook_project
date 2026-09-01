import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager } from 'typeorm';
import { TransactionContext } from './transaction.context.js';

/**
 * Mức cách ly. TypeORM không xuất kiểu này ra ngoài nên khai lại ở đây —
 * chép một dòng còn hơn moi vào đường dẫn nội bộ của thư viện, thứ sẽ đổi mà
 * không báo trước.
 */
export type TIsolationLevel =
  | 'READ UNCOMMITTED'
  | 'READ COMMITTED'
  | 'REPEATABLE READ'
  | 'SERIALIZABLE';

/**
 * Đơn vị công việc (Unit of Work).
 *
 *   await this.tx.run(async () => {
 *     const user = await this.users.create(...);
 *     await this.identities.create(...);
 *     await this.stats.create(...);
 *   });
 *
 * Ba câu lệnh trên hoặc vào hết, hoặc không câu nào vào. Không có trạng thái
 * "user đã có mà chưa có dòng đếm" — cái trạng thái đó sẽ làm hỏng mọi thứ
 * chạm vào nó về sau, và nó chỉ xuất hiện khi server chết đúng vào giữa.
 *
 * **Lồng nhau thì NHẬP vào, không mở giao dịch mới.** Đây là quyết định, không
 * phải giới hạn: `run()` trong `run()` mà mở giao dịch con thì đoạn trong có
 * thể được ghi lại trong khi đoạn ngoài bị huỷ — nửa vời, và rất khó nhìn ra.
 * Cần một giao dịch thật sự tách rời thì gọi `runIsolated()`, và phải cố ý.
 */
@Injectable()
export class TransactionService {
  private readonly log = new Logger('Transaction');

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    // Cho `@Transactional()` mượn — decorator không có chỗ nào để tiêm phụ thuộc.
    registerTransactionService(this);
  }

  /** Chạy trong giao dịch. Đang ở trong một giao dịch rồi thì nhập vào nó. */
  run<T>(work: () => Promise<T>): Promise<T> {
    if (TransactionContext.active) return work();
    return this.dataSource.transaction((manager) => TransactionContext.run(manager, work));
  }

  /**
   * Mở một giao dịch MỚI kể cả khi đang ở trong một giao dịch khác.
   *
   * Hiếm khi đúng. Dùng khi cần ghi một thứ phải ở lại dù việc chính bị huỷ —
   * ví dụ một dòng sổ kiểm toán ghi lại chính lần thất bại đó.
   */
  runIsolated<T>(work: () => Promise<T>, isolation?: TIsolationLevel): Promise<T> {
    this.log.debug('opening an isolated transaction');
    const runner = (manager: EntityManager) => TransactionContext.run(manager, work);
    return isolation
      ? this.dataSource.transaction(isolation, runner)
      : this.dataSource.transaction(runner);
  }
}

// ── Cho decorator mượn ───────────────────────────────────────────────────────
//
// `@Transactional()` chạy lúc dựng lớp, trước khi Nest có gì để tiêm. Cách duy
// nhất để nó với tới `TransactionService` là qua một chỗ gửi ở tầng module.
// Không đẹp, nhưng nó KÍN: chỉ hai hàm dưới đây đụng vào, và không xuất ra
// ngoài thư mục này.
let singleton: TransactionService | null = null;

function registerTransactionService(service: TransactionService): void {
  singleton = service;
}

export function currentTransactionService(): TransactionService {
  if (!singleton) {
    throw new Error(
      '@Transactional() ran before TransactionService was constructed. ' +
        'Check that DatabaseModule is imported in AppModule.',
    );
  }
  return singleton;
}
