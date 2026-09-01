import { AsyncLocalStorage } from 'node:async_hooks';
import type { EntityManager } from 'typeorm';

/**
 * Chỗ cất `EntityManager` của giao dịch ĐANG chạy.
 *
 * `AsyncLocalStorage` giữ giá trị theo NHÁNH gọi chứ không theo biến toàn cục:
 * hai request chạy song song, mỗi cái có giao dịch riêng, không thấy của nhau.
 *
 * Vì sao cần: nếu không có nó thì mỗi hàm phải nhận thêm một tham số `manager`
 * và chuyền tay nhau qua bốn năm tầng. Quên chuyền ở một chỗ là câu lệnh đó
 * chạy NGOÀI giao dịch — vẫn ghi được, vẫn không báo lỗi, và khi giao dịch bị
 * huỷ thì nó ở lại. Đó là loại bug tìm bằng mắt không ra.
 */
const storage = new AsyncLocalStorage<EntityManager>();

export const TransactionContext = {
  /** Chạy `work` bên trong một giao dịch. Mọi kho gọi trong đó sẽ tự bám vào. */
  run<T>(manager: EntityManager, work: () => Promise<T>): Promise<T> {
    return storage.run(manager, work);
  },

  /** `EntityManager` đang hiện hành, hoặc `undefined` nếu đang ở ngoài giao dịch. */
  current(): EntityManager | undefined {
    return storage.getStore();
  },

  /** Đang ở trong một giao dịch hay không. */
  get active(): boolean {
    return storage.getStore() !== undefined;
  },
} as const;
