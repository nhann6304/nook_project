import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityTarget, type ObjectLiteral } from 'typeorm';
import { BaseRepository } from './base.repository.js';
import { GenericRepository } from './generic.repository.js';

/**
 * Phát kho cho bất kỳ bảng nào.
 *
 *   constructor(private readonly repos: RepositoryManager) {}
 *   private readonly moments = this.repos.for(Moment);
 *
 * Module không có câu truy vấn riêng thì **không cần viết tệp kho nào cả**.
 * Có câu riêng thì vẫn viết lớp kế thừa `BaseRepository` như thường — hai cách
 * dùng chung một lớp gốc nên hành vi giống hệt nhau: cùng bám giao dịch, cùng
 * tự điền sổ ghi việc.
 *
 * Kho được giữ lại theo bảng. Giữ lại được vì kho **không mang trạng thái** —
 * nó hỏi `TransactionContext` lúc dùng chứ không ôm sẵn một `Repository`. Nếu
 * nó ôm sẵn thì giữ lại chính là cách làm hỏng chuyện giao dịch.
 */
@Injectable()
export class RepositoryManager {
  private readonly cache = new Map<EntityTarget<ObjectLiteral>, BaseRepository<ObjectLiteral>>();

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  for<T extends ObjectLiteral>(entity: EntityTarget<T>): BaseRepository<T> {
    const hit = this.cache.get(entity as EntityTarget<ObjectLiteral>);
    if (hit) return hit as unknown as BaseRepository<T>;

    const made = new GenericRepository<T>(this.dataSource, entity);
    this.cache.set(entity as EntityTarget<ObjectLiteral>, made as unknown as BaseRepository<ObjectLiteral>);
    return made;
  }
}
