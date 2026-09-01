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
import { RequestContext } from '../context/index.js';

/**
 * Con trỏ trang là cặp (thời gian, id) gói lại, KHÔNG phải số trang.
 *
 * Gói bằng base64url để nó trông như một chuỗi mờ — người ta bớt bị cám dỗ tự
 * chế ra một con trỏ. Đây không phải bảo mật: ai muốn mở ra vẫn mở được, và
 * cũng không có gì bí mật bên trong.
 */
function encodeCursor(at: Date, id: string): string {
  return Buffer.from(`${at.toISOString()}|${id}`).toString('base64url');
}

function decodeCursor(cursor?: string): { at: Date; id: string } | null {
  if (!cursor) return null;
  const [at, id] = Buffer.from(cursor, 'base64url').toString().split('|');
  if (!at || !id) return null;
  const when = new Date(at);
  return Number.isNaN(when.getTime()) ? null : { at: when, id };
}

/** Tên cột sổ ghi việc. Khai một chỗ để chỗ dò và chỗ điền không lệch nhau. */
const AUDIT = { createdBy: 'createdBy', updatedBy: 'updatedBy', deletedBy: 'deletedBy' } as const;

/**
 * Kho dữ liệu — lớp gốc cho mọi kho.
 *
 * Ba việc nó làm, và chỉ ba việc:
 *
 * **1. Tự bám vào giao dịch đang chạy.** Xem `this.repo`: nó hỏi
 * `TransactionContext` xem có giao dịch nào đang mở không, có thì lấy
 * `Repository` của giao dịch đó. Nhờ vậy dịch vụ không phải chuyền tay
 * `manager` qua từng tầng — và không có chỗ nào để quên chuyền.
 *
 * **2. Tự điền sổ ghi việc.** Bảng nào kế thừa `AuditEntity` thì `created_by`
 * và `updated_by` được điền từ `RequestContext`, không tầng nào phải nhớ.
 * Bảng không có mấy cột đó thì bỏ qua, im lặng và đúng.
 *
 * **3. Gom mấy câu ai cũng cần.** `findById`, `exists`, `count`, `page`…
 *
 * Nó KHÔNG làm: câu truy vấn của nghiệp vụ. Câu nào riêng của `User` thì viết
 * ở `UserRepository`. Lớp gốc phình ra là lớp gốc bắt đầu biết quá nhiều về
 * những thứ nó không nên biết.
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

  /** Bảng này có cột đó không. Hỏi TypeORM, không đoán theo tên lớp. */
  protected has(column: string): boolean {
    return this.repo.metadata.columns.some((c) => c.propertyName === column);
  }

  /** Bảng này xoá mềm được không (có kế thừa `SoftDeleteEntity` không). */
  supportsSoftDelete(): boolean {
    return this.has(AUDIT.deletedBy);
  }

  /** Tên bảng — cho câu lỗi nói đúng chỗ. */
  get tableName(): string {
    return this.repo.metadata.tableName;
  }

  // ── Mấy câu ai cũng cần ────────────────────────────────────────────────────

  findById(id: string, options?: Omit<FindOneOptions<T>, 'where'>): Promise<T | null> {
    // `id` là khoá chính của mọi bảng kế thừa `UuidEntity`; TypeScript không
    // biết điều đó nên phải nói cho nó.
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

  /**
   * Một trang, lật bằng CON TRỎ.
   *
   * Sắp theo `created_at` giảm dần rồi `id` giảm dần. `id` là chốt phá hoà:
   * hai dòng tạo cùng một micro-giây mà chỉ sắp theo thời gian thì thứ tự
   * giữa chúng không xác định, và trang sau có thể nhảy qua hoặc lặp lại một
   * dòng — im lặng, người dùng chỉ thấy app "hơi kỳ".
   *
   * Chỉ chạy được trên bảng có `created_at`. Bảng khác gọi vào là ném.
   */
  async pageByCursor(
    input: { cursor?: string | undefined; limit: number },
    where?: FindOptionsWhere<T>,
  ): Promise<{ items: T[]; nextCursor: string | null }> {
    if (!this.has('createdAt')) {
      throw new Error(`${this.tableName} không có created_at nên không lật trang bằng con trỏ được`);
    }

    const alias = 'row';
    const qb = this.repo.createQueryBuilder(alias);
    if (where) qb.where(where);

    const mark = decodeCursor(input.cursor);
    if (mark) {
      // "Cũ hơn cái cuối cùng đã trả" — so cặp (thời gian, id) chứ không so
      // riêng thời gian, cùng lý do với chốt phá hoà ở trên.
      qb.andWhere(
        `(${alias}.createdAt, ${alias}.id) < (:markAt, :markId)`,
        { markAt: mark.at, markId: mark.id },
      );
    }

    // Xin dư MỘT dòng để biết còn nữa hay không, khỏi phải đếm cả bảng.
    const rows = await qb
      .orderBy(`${alias}.createdAt`, 'DESC')
      .addOrderBy(`${alias}.id`, 'DESC')
      .take(input.limit + 1)
      .getMany();

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    const last = items.at(-1);

    return {
      items,
      nextCursor: hasMore && last ? encodeCursor(last.createdAt as Date, last.id as string) : null,
    };
  }

  // ── Ghi ────────────────────────────────────────────────────────────────────

  /**
   * Dựng đối tượng trong bộ nhớ RỒI ghi — hai bước để hook của entity còn chạy.
   * `created_by` và `updated_by` tự điền nếu bảng có.
   */
  create(data: DeepPartial<T>): Promise<T> {
    return this.repo.save(this.repo.create(this.stampCreate(data)));
  }

  save(entity: T): Promise<T> {
    return this.repo.save(this.stampUpdate(entity));
  }

  /**
   * Sửa thẳng bằng UPDATE, không đọc lên trước.
   *
   * Nhanh hơn `save` một vòng gọi, nhưng KHÔNG chạy hook của entity và không
   * trả về dòng đã sửa. Dùng khi chỉ cần chấm một cột — `revoked_at`,
   * `last_seen_at` — chứ đừng dùng thay `save` ở đường nghiệp vụ.
   */
  async update(
    where: FindOptionsWhere<T>,
    patch: Parameters<Repository<T>['update']>[1],
  ): Promise<number> {
    const result = await this.repo.update(where, this.stampUpdate(patch));
    return result.affected ?? 0;
  }

  async delete(where: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repo.delete(where);
    return result.affected ?? 0;
  }

  /**
   * Đánh dấu đã xoá thay vì xoá thật. Chỉ chạy được trên bảng kế thừa
   * `SoftDeleteEntity` — bảng khác gọi vào là ném, chứ không im lặng không làm gì.
   */
  async softDelete(id: string): Promise<number> {
    if (!this.has(AUDIT.deletedBy)) {
      throw new Error(`${this.repo.metadata.tableName} không kế thừa SoftDeleteEntity`);
    }
    const actor = RequestContext.actorId();
    if (actor) {
      await this.repo.update({ id } as unknown as FindOptionsWhere<T>, {
        [AUDIT.deletedBy]: actor,
      } as never);
    }
    const result = await this.repo.softDelete(id);
    return result.affected ?? 0;
  }

  async restore(id: string): Promise<number> {
    const result = await this.repo.restore(id);
    return result.affected ?? 0;
  }

  // ── Sổ ghi việc ────────────────────────────────────────────────────────────

  /** Đóng dấu người tạo. Không có ai đang gọi (đường công khai) thì để trống. */
  private stampCreate<D extends object>(data: D): D {
    const actor = RequestContext.actorId();
    if (!actor) return data;
    const stamped = { ...data } as Record<string, unknown>;
    if (this.has(AUDIT.createdBy) && stamped[AUDIT.createdBy] === undefined) {
      stamped[AUDIT.createdBy] = actor;
    }
    if (this.has(AUDIT.updatedBy) && stamped[AUDIT.updatedBy] === undefined) {
      stamped[AUDIT.updatedBy] = actor;
    }
    return stamped as D;
  }

  /** Đóng dấu người sửa. Luôn đè — lần sửa gần nhất mới là thứ đáng biết. */
  private stampUpdate<D extends object>(data: D): D {
    const actor = RequestContext.actorId();
    if (!actor || !this.has(AUDIT.updatedBy)) return data;
    return { ...data, [AUDIT.updatedBy]: actor } as unknown as D;
  }
}
