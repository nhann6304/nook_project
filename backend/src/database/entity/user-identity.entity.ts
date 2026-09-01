import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './base.entity.js';
import { User } from './user.entity.js';

/** Email hay số điện thoại. Tách bảng vì một người có thể có cả hai. */
export type IdentityKind = 'email' | 'phone';

/**
 * Đích đăng nhập.
 *
 * `value` đã được CHUẨN HOÁ trước khi ghi: email hạ hết chữ thường, số điện
 * thoại đưa về E.164 (+84…). Chuẩn hoá là việc của service, không phải của
 * người dùng — họ gõ "  Nam@Gmail.Com " thì vẫn phải vào đúng một tài khoản.
 */
@Entity('user_identities')
@Unique('uq_identity_kind_value', ['kind', 'value'])
export class UserIdentity extends BaseEntity {
  @Index('idx_identity_user')
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.identities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'kind', type: 'varchar', length: 8 })
  kind!: IdentityKind;

  /** Đã chuẩn hoá. 320 là trần độ dài email theo RFC. */
  @Column({ name: 'value', type: 'varchar', length: 320 })
  value!: string;

  /** Lần cuối nhập đúng mã gửi tới đích này. */
  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;
}
