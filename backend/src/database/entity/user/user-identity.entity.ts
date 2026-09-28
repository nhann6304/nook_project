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
@Unique('uq_identity_kind_value_key', ['kind', 'valueKey'])
export class UserIdentity extends AuditEntity {
  @Index('idx_identity_user')
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'kind', type: 'varchar', length: 8 })
  kind!: TIdentityKind;

  /** Đã chuẩn hoá. 320 là trần độ dài email theo RFC. Đây là chỗ GỬI THƯ TỚI. */
  @Column({ name: 'value', type: 'varchar', length: 320 })
  value!: string;

  /**
   * `value` rút về dạng khoá — xem `identityKey()`. Khoá duy nhất đặt ở ĐÂY,
   * không đặt ở `value`: `nam@gmail.com` và `nam+1@gmail.com` là hai `value`
   * khác nhau nhưng cùng một hộp thư, nên phải là cùng một tài khoản.
   */
  @Column({ name: 'value_key', type: 'varchar', length: 320 })
  valueKey!: string;

  /** Lần cuối nhập đúng mã gửi tới đích này. */
  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;
}
