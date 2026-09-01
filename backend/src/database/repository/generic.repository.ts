import type { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { BaseRepository } from './base.repository.js';

/**
 * Kho dùng NGAY, không phải viết lớp con.
 *
 * `BaseRepository` là lớp trừu tượng — muốn có một cái kho thì phải viết một
 * lớp kế thừa nó. Với module có câu truy vấn riêng thì đúng là nên vậy. Nhưng
 * module chỉ cần thêm/sửa/xoá cơ bản mà cũng phải viết một tệp năm dòng chẳng
 * nói lên điều gì thì đó là nghi thức, không phải kiến trúc.
 *
 * Đừng dựng thẳng lớp này bằng `new`. Hỏi `RepositoryManager.for(Entity)` —
 * nó giữ lại để dùng lại, và nó biết `DataSource` ở đâu.
 */
export class GenericRepository<T extends ObjectLiteral> extends BaseRepository<T> {
  constructor(dataSource: DataSource, target: EntityTarget<T>) {
    super(dataSource, target);
  }
}
