import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Ai đang thao tác, và request nào. Giữ theo NHÁNH GỌI nên hai request song
 * song không thấy của nhau.
 *
 * Không có nó thì `actorId` phải chuyền tay qua bốn năm tầng, và quên một chỗ
 * là `created_by = null` — vẫn ghi được, không ai báo lỗi.
 */
export interface IRequestStore {
  /** Dấu vết của request. Có ngay từ đầu. */
  requestId: string;
  /**
   * `null` trên đường `@Public()`, và null là ĐÚNG ở đó. Điền sau khi cổng thẻ
   * chạy xong bằng cách sửa thẳng đối tượng này — nó cất trước khi có thẻ.
   */
  userId: string | null;
}

const storage = new AsyncLocalStorage<IRequestStore>();

export const RequestContext = {
  /** Mở một vùng cho một request. Gọi ở lớp giữa, sớm nhất có thể. */
  run<T>(store: IRequestStore, work: () => T): T {
    return storage.run(store, work);
  },

  current(): IRequestStore | undefined {
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
