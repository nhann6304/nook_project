import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity.js';
import { User } from './user.entity.js';

/**
 * Một phiên = một máy đã đăng nhập.
 *
 * `id` của dòng này chính là `sid` nằm trong thẻ. Nhờ vậy mà thu hồi được
 * TỪNG MÁY một, thay vì đá văng người ta ra khỏi mọi máy cùng lúc.
 *
 * Cột lưu là **dấu vân** của thẻ dài hạn, không phải thẻ. Ai đọc trộm được
 * bảng này cũng không đăng nhập thay ai được — argon2 không quay ngược.
 */
@Entity('sessions')
export class Session extends BaseEntity {
  @Index('idx_session_user')
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /** argon2 của thẻ dài hạn. Đổi mỗi lần làm mới thẻ. */
  @Column({ name: 'refresh_hash', type: 'varchar', length: 255 })
  refreshHash!: string;

  /** "iPhone của Nam". Người dùng đọc để biết nên thu hồi máy nào. */
  @Column({ name: 'device_name', type: 'varchar', length: 64, nullable: true })
  deviceName!: string | null;

  /** 'ios' | 'android' | 'web' */
  @Column({ name: 'platform', type: 'varchar', length: 16, nullable: true })
  platform!: string | null;

  @Column({ name: 'app_version', type: 'varchar', length: 24, nullable: true })
  appVersion!: string | null;

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true })
  ip!: string | null;

  @Index('idx_session_expires')
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  /** Có ngày ở đây là phiên đã chết. Không xoá dòng — còn để lại dấu vết. */
  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;
}
