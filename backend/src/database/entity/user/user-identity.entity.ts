import { Column, Entity, Index, Unique } from 'typeorm';
import { AuditEntity } from '../base/index.js';

/** Email hay số điện thoại. Tách bảng vì một người có thể có cả hai. */
export type TIdentityKind = 'email' | 'phone';

/**
 * Đích đăng nhập.
 *
 * Không dùng `@ManyToOne` — cấu trúc nhiều-về-một vẫn giữ bằng khoá ngoại
 * trong cơ sở dữ liệu, `userId` chỉ là cột `uuid`. Lý do đủ ở `backend/README`;
 * cái đau nhất: hai entity nhập khẩu lẫn nhau, ở ESM là server chết lúc nạp.
 *
 * `value` đã CHUẨN HOÁ trước khi ghi (email hạ chữ thường, số về E.164) — gõ
 * "  Nam@Gmail.Com " vẫn phải vào đúng một tài khoản.
 */
@Entity('user_identities')
@Unique('uq_identity_kind_value', ['kind', 'value'])
export class UserIdentity extends AuditEntity {
  @Index('idx_identity_user')
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'kind', type: 'varchar', length: 8 })
  kind!: TIdentityKind;

  /** Đã chuẩn hoá. 320 là trần độ dài email theo RFC. */
  @Column({ name: 'value', type: 'varchar', length: 320 })
  value!: string;

  /** Lần cuối nhập đúng mã gửi tới đích này. */
  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;
}
