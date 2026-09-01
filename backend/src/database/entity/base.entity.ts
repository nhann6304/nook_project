import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Ba cột mà gần như bảng nào cũng có. Bảng nào KHÔNG hợp thì đừng kế thừa —
 * `user_stats` và `user_achievements` là ví dụ, khoá chính của chúng không phải
 * uuid tự sinh.
 *
 * `timestamptz` chứ không phải `timestamp`: máy chủ chạy giờ UTC, người dùng
 * sống ở giờ khác. Cột không mang múi giờ là chỗ hẹn của một lớp bug im lặng.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
