import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Ai đang thao tác, và request nào.
 *
 * Cùng một cách làm với `TransactionContext`: `AsyncLocalStorage` giữ giá trị
 * theo NHÁNH GỌI, nên hai request chạy song song không thấy của nhau.
 *
 * Vì sao cần: không có nó thì mọi hàm muốn ghi `created_by` đều phải nhận thêm
 * một tham số `actorId` và chuyền tay qua bốn năm tầng. Quên chuyền ở một chỗ
 * là dòng đó có `created_by = null` — vẫn ghi được, vẫn không báo lỗi, và sáu
 * tháng sau không ai truy ra được ai đã tạo nó.
 */
export interface RequestStore {
  /** Dấu vết của request. Có ngay từ đầu. */
  requestId: string;
  /**
   * Người đang gọi. `null` trên đường `@Public()` — và null là ĐÚNG ở đó:
   * lúc mở tài khoản thì chưa có ai để ghi vào `created_by`.
   *
   * Điền vào sau khi cổng thẻ chạy xong, bằng cách sửa thẳng vào đối tượng
   * này — nó được cất trước khi có thẻ, nên phải sửa được về sau.
   */
  userId: string | null;
}

const storage = new AsyncLocalStorage<RequestStore>();

export const RequestContext = {
  /** Mở một vùng cho một request. Gọi ở lớp giữa, sớm nhất có thể. */
  run<T>(store: RequestStore, work: () => T): T {
    return storage.run(store, work);
  },

  current(): RequestStore | undefined {
    return storage.getStore();
  },

  /** Id người đang gọi, hoặc `null`. Đây là thứ mà kho dữ liệu hỏi. */
  actorId(): string | null {
    return storage.getStore()?.userId ?? null;
  },

  requestId(): string | null {
    return storage.getStore()?.requestId ?? null;
  },

  /** Cổng thẻ gọi sau khi biết được người gọi là ai. */
  setActor(userId: string): void {
    const store = storage.getStore();
    if (store) store.userId = userId;
  },
} as const;
