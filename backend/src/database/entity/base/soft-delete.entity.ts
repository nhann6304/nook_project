import { Column, DeleteDateColumn } from 'typeorm';
import { AuditEntity } from './audit.entity.js';

/**
 * Bảng mà "xoá" nghĩa là **đánh dấu**, không phải mất.
 *
 * Chỉ dùng khi có lý do thật. Ba lý do hợp lệ ở dự án này:
 *   · người dùng tự xoá tài khoản mà luật đòi giữ lại một thời gian
 *   · dòng bị người khác trỏ tới, xoá thật là làm gãy chỗ trỏ
 *   · cần biết một thứ TỪNG tồn tại
 *
 * Không có lý do nào trong ba cái đó thì **xoá thật**. Xoá mềm bừa bãi là để
 * lại một bãi dữ liệu chết mà mọi câu truy vấn về sau đều phải nhớ né, và sẽ
 * có câu quên né.
 *
 * `@DeleteDateColumn` làm TypeORM tự thêm `WHERE deleted_at IS NULL` vào mọi
 * câu `find`. Muốn thấy cả dòng đã xoá thì phải nói ra: `withDeleted: true`.
 */
export abstract class SoftDeleteEntity extends AuditEntity {
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  deletedBy!: string | null;
}
