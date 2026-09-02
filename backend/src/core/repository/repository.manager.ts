import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityTarget, type ObjectLiteral } from 'typeorm';
import { BaseRepository } from './base.repository.js';
import { GenericRepository } from './generic.repository.js';

/**
 * Phát kho cho bất kỳ bảng nào — `this.repos.for(Moment)`. Module không có câu
 * truy vấn riêng thì khỏi viết tệp kho nào.
 *
 * Giữ lại theo bảng được vì kho KHÔNG mang trạng thái: nó hỏi
 * `TransactionContext` lúc dùng. Ôm sẵn một `Repository` là hỏng giao dịch.
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
