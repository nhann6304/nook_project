import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UuidEntity } from './uuid.entity.js';

/**
 * Bảng có ghi lại **lúc nào** và **ai**.
 *
 * `created_by` / `updated_by` do `BaseRepository` tự điền từ `RequestContext` —
 * không tầng nào phải chuyền tay id người gọi. Đó là cả điểm của lớp này: nếu
 * phải nhớ mà điền thì sẽ có chỗ quên, và chỗ quên đó im lặng.
 *
 * Cả hai đều cho phép rỗng, và rỗng là ĐÚNG ở hai trường hợp:
 *   · dòng do chính hệ thống tạo (chạy nền, migration)
 *   · dòng tạo ra trước khi biết người gọi là ai — mở tài khoản chẳng hạn
 *
 * KHÔNG đặt khoá ngoại về `users`. Xoá một người mà làm hỏng cả sổ ghi việc
 * họ từng làm thì sổ đó không còn là sổ nữa.
 *
 * `timestamptz` chứ không phải `timestamp`: máy chủ chạy giờ UTC, người dùng
 * sống ở giờ khác. Cột không mang múi giờ là chỗ hẹn của một lớp bug im lặng.
 */
export abstract class AuditEntity extends UuidEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;
}
