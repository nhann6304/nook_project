import { HttpStatus } from '@nestjs/common';
import type { DeepPartial, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { ERR, type CursorPage, type ErrCode } from '@nook/shared';
import type { BaseRepository } from '../../../database/repository/index.js';
import { AppException } from '../error/index.js';
import type { BaseMapper } from '../mapper/index.js';
import type { CursorQueryDto } from '../dto/index.js';

/**
 * Thêm · đọc · sửa · xoá, viết một lần cho mọi module.
 *
 *   @Injectable()
 *   export class MomentService extends BaseCrudService<Moment, MomentDto> {
 *     constructor(repos: RepositoryManager, mapper: MomentMapper) {
 *       super(repos.for(Moment), mapper);
 *     }
 *   }
 *
 * Chừng đó là đã có đủ sáu cửa cơ bản. Module nào cần khác thì **đè lên đúng
 * cái phương thức đó**, mấy cái còn lại giữ nguyên:
 *
 *   override async create(input: DeepPartial<Moment>) {
 *     await this.assertUnderDailyCap();
 *     return super.create(input);
 *   }
 *
 * ── Hai chỗ cố ý KHÔNG làm ──────────────────────────────────────────────────
 *
 * **Không có `@Transactional()` ở đây.** Mỗi phương thức dưới đây chỉ chạy MỘT
 * câu lệnh, mà một câu lệnh thì Postgres đã tự bọc trong giao dịch rồi. Bọc
 * thêm một lớp nữa là thêm một vòng BEGIN/COMMIT không mua được gì. Module nào
 * ghi nhiều bảng trong một việc thì tự dán `@Transactional()` lên phương thức
 * của nó — đó mới là lúc cần.
 *
 * **Không có hook `beforeCreate` / `afterCreate`.** Cần chen việc vào thì đè
 * phương thức rồi gọi `super`. Hook nghe thì tiện, nhưng nó làm luồng chạy
 * biến mất khỏi chỗ đọc: nhìn `create()` không còn biết được thật ra có bao
 * nhiêu thứ chạy.
 */
export abstract class BaseCrudService<E extends ObjectLiteral, Dto> {
  protected constructor(
    protected readonly repo: BaseRepository<E>,
    protected readonly mapper: BaseMapper<E, Dto>,
  ) {}

  /**
   * Mã lỗi khi không tìm thấy. Đè lại để nói đúng miền:
   *
   *   protected override notFoundCode() { return ERR.USER_NOT_FOUND; }
   *
   * Mặc định là mã chung — app vẫn tra được chữ, chỉ là chữ chung chung hơn.
   */
  protected notFoundCode(): ErrCode {
    return ERR.NOT_FOUND;
  }

  async create(input: DeepPartial<E>): Promise<Dto> {
    return this.mapper.toDto(await this.repo.create(input));
  }

  async findById(id: string): Promise<Dto> {
    return this.mapper.toDto(await this.mustFind(id));
  }

  async findAll(where?: FindOptionsWhere<E>): Promise<Dto[]> {
    return this.mapper.toDtoList(await this.repo.find(where ? { where } : undefined));
  }

  /** Một trang, lật bằng con trỏ. Bảng phải có `created_at`. */
  async page(query: CursorQueryDto, where?: FindOptionsWhere<E>): Promise<CursorPage<Dto>> {
    const { items, nextCursor } = await this.repo.pageByCursor(
      { cursor: query.cursor, limit: query.limit },
      where,
    );
    return { items: this.mapper.toDtoList(items), nextCursor };
  }

  async update(id: string, patch: Parameters<Repository<E>['update']>[1]): Promise<Dto> {
    await this.mustFind(id);
    await this.repo.update({ id } as unknown as FindOptionsWhere<E>, patch);
    return this.mapper.toDto(await this.mustFind(id));
  }

  /**
   * Xoá. Bảng kế thừa `SoftDeleteEntity` thì đánh dấu, không thì xoá thật.
   *
   * Quyết định nằm ở BẢNG chứ không ở chỗ gọi, và đó là chủ ý: cùng một lời
   * gọi mà lúc xoá mềm lúc xoá thật tuỳ tham số là một cách mất dữ liệu vào
   * ngày ai đó truyền nhầm.
   */
  async remove(id: string): Promise<void> {
    await this.mustFind(id);
    if (this.repo.supportsSoftDelete()) await this.repo.softDelete(id);
    else await this.repo.delete({ id } as unknown as FindOptionsWhere<E>);
  }

  /** Lấy dòng, không có thì ném. Lớp con dùng lại được. */
  protected async mustFind(id: string): Promise<E> {
    const found = await this.repo.findById(id);
    if (!found) throw new AppException(this.notFoundCode(), HttpStatus.NOT_FOUND);
    return found;
  }
}
