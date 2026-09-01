import { currentTransactionService } from './transaction.service.js';

/**
 * Bọc cả một hàm trong giao dịch.
 *
 *   @Transactional()
 *   async createAccount(...) { … }
 *
 * Giống hệt việc tự tay gọi `this.tx.run(...)`, chỉ khác chỗ nhìn thấy nó.
 * Dùng cái nào cũng được — nhưng **đừng trộn hai cách trong cùng một lớp**,
 * người đọc sau sẽ tưởng chúng khác nhau.
 *
 * Một chỗ dễ vấp: decorator chỉ ăn khi hàm được gọi QUA đối tượng
 * (`this.service.doThing()`). Tách hàm ra thành biến rồi gọi thì mất `this` và
 * mất luôn lớp bọc.
 */
export function Transactional(): MethodDecorator {
  return (_target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    if (typeof original !== 'function') {
      throw new Error(`@Transactional() chỉ dán được lên phương thức: ${String(propertyKey)}`);
    }

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      return currentTransactionService().run(() => original.apply(this, args));
    };

    return descriptor;
  };
}
