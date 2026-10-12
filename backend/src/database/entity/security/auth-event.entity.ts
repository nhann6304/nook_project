import { Column, CreateDateColumn, Entity, Index } from 'typeorm';
import type { TAuthEventKind, TRiskFlag } from '@nook/shared';
import { UuidEntity } from '../base/index.js';

/**
 * Sổ đăng nhập — **chỉ ghi thêm**, không sửa. Dòng quá 180 ngày bị việc nền
 * xoá (`AuthSweepProcessor`).
 *
 * Chỉ ghi cho tài khoản CÓ THẬT (`user_id` NOT NULL): gõ sai vào email không
 * có tài khoản đã được đếm ở Redis; ghi cả nó vào đây thì một đợt dò mật khẩu
 * hàng loạt đổ thẳng vào bảng mà không ai đọc.
 *
 * Model/os chép lại vào từng dòng chứ không trỏ sang `user_devices`: lần thử
 * HỎNG không được tạo máy (xem `AuthAuditService`), mà vẫn phải biết máy nào.
 */
@Entity('auth_events')
@Index('idx_auth_event_user_time', ['userId', 'createdAt'])
@Index('idx_auth_event_time', ['createdAt'])
export class AuthEvent extends UuidEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'kind', type: 'varchar', length: 16 })
  kind!: TAuthEventKind;

  @Column({ name: 'device_id', type: 'uuid', nullable: true })
  deviceId!: string | null;

  @Column({ name: 'model', type: 'varchar', length: 64, nullable: true })
  model!: string | null;

  @Column({ name: 'os', type: 'varchar', length: 64, nullable: true })
  os!: string | null;

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true })
  ip!: string | null;

  @Column({ name: 'country', type: 'char', length: 2, nullable: true })
  country!: string | null;

  @Column({ name: 'risk', type: 'text', array: true, default: () => "'{}'" })
  risk!: TRiskFlag[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
