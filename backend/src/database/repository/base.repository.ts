import type {
  DataSource,
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { TransactionContext } from '../transaction/index.js';

/**
 * Kho dữ liệu — lớp gốc cho mọi kho.
 *
 * Hai việc nó làm, và chỉ hai việc:
 *
 * **1. Tự bám vào giao dịch đang chạy.** Đây là lý do lớp này tồn tại. Xem
 * `this.repo` bên dưới: nó hỏi `TransactionContext` xem có giao dịch nào đang
 * mở không, có thì lấy `Repository` của giao dịch đó. Nhờ vậy dịch vụ không
 * phải chuyền tay `manager` qua từng tầng — và không có chỗ nào để quên chuyền.
 *
 * **2. Gom mấy câu hay dùng.** `findById`, `exists`, `count`… — để không phải
 * chép lại cùng một dòng ở mười cái kho.
 *
 * Nó KHÔNG làm: câu truy vấn của nghiệp vụ. Câu nào riêng của `User` thì viết ở
 * `UserRepository`, đừng nhét vào đây. Lớp gốc mà phình ra là lớp gốc bắt đầu
 * biết quá nhiều về những thứ nó không nên biết.
 *
 * Vì sao không dùng thẳng `@InjectRepository(User)`: cách đó trả về một
 * `Repository` NEO CỨNG vào kết nối gốc. Gọi nó bên trong `tx.run()` thì câu
 * lệnh vẫn chạy ngoài giao dịch — ghi được, không báo lỗi, và ở lại kể cả khi
 * giao dịch bị huỷ.
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected constructor(
    private readonly dataSource: DataSource,
    private readonly target: EntityTarget<T>,
  ) {}

  /**
   * `Repository` để dùng ngay lúc này.
   *
   * Đang trong giao dịch → lấy của giao dịch. Không → lấy của kết nối gốc.
   * Mọi câu lệnh trong lớp con phải đi qua đây, không đi vòng.
   */
  protected get repo(): Repository<T> {
    return this.manager.getRepository(this.target);
  }

  /** `EntityManager` hiện hành. Cho câu SQL thô: `this.manager.query(...)`. */
  protected get manager(): EntityManager {
    return TransactionContext.current() ?? this.dataSource.manager;
  }

  // ── Mấy câu ai cũng cần ────────────────────────────────────────────────────

  findById(id: string, options?: Omit<FindOneOptions<T>, 'where'>): Promise<T | null> {
    // `id` là khoá chính của mọi bảng có kế thừa `BaseEntity`; TypeScript
    // không biết điều đó nên phải nói cho nó.
    return this.repo.findOne({ ...options, where: { id } as unknown as FindOptionsWhere<T> });
  }

  findOne(where: FindOptionsWhere<T>, options?: Omit<FindOneOptions<T>, 'where'>): Promise<T | null> {
    return this.repo.findOne({ ...options, where });
  }

  find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repo.count(where ? { where } : {});
  }

  exists(where: FindOptionsWhere<T>): Promise<boolean> {
    return this.repo.existsBy(where);
  }

  /** Dựng đối tượng trong bộ nhớ RỒI ghi. Hai bước để hook của entity còn chạy. */
  create(data: DeepPartial<T>): Promise<T> {
    return this.repo.save(this.repo.create(data));
  }

  save(entity: T): Promise<T> {
    return this.repo.save(entity);
  }

  /**
   * Sửa thẳng bằng UPDATE, không đọc lên trước.
   *
   * Nhanh hơn `save` một vòng gọi, nhưng KHÔNG chạy hook của entity và không
   * trả về dòng đã sửa. Dùng khi chỉ cần chấm một cột — `revoked_at`,
   * `last_seen_at` — chứ đừng dùng thay `save` ở đường nghiệp vụ.
   */
  async update(where: FindOptionsWhere<T>, patch: Parameters<Repository<T>['update']>[1]): Promise<number> {
    const result = await this.repo.update(where, patch);
    return result.affected ?? 0;
  }

  async delete(where: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repo.delete(where);
    return result.affected ?? 0;
  }
}
