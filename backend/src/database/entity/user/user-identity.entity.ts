import { Column, Entity, Index, Unique } from 'typeorm';
import { AuditEntity } from '../base/index.js';

/** Email hay số điện thoại. Tách bảng vì một người có thể có cả hai. */
export type TIdentityKind = 'email' | 'phone';

/**
 * Đích đăng nhập.
 *
 * ── Không dùng quan hệ ORM ──────────────────────────────────────────────────
 *
 * Cấu trúc vẫn là **nhiều-về-một**: nhiều dòng ở đây trỏ về một `users`, và
 * ràng buộc khoá ngoại vẫn nằm trong cơ sở dữ liệu (xem migration). Chỉ có
 * `@ManyToOne` là không dùng.
 *
 * Vì sao: decorator quan hệ kéo theo một đống thứ không nhìn thấy —
 *   · nạp thừa hay thiếu tuỳ chỗ gọi có nhớ khai `relations` hay không
 *   · sinh câu JOIN mà không ai đọc được nó ra sao cho tới lúc log SQL
 *   · buộc hai tệp entity nhập khẩu lẫn nhau, và ở ESM thì vòng tròn đó làm
 *     server chết ngay lúc nạp
 *   · đổi hành vi ngầm: từ khi `User` xoá mềm, phần nối bảng tự lọc bỏ người
 *     đã xoá, và một nhánh kiểm đang đúng bỗng ngã
 *
 * Thay vào đó: **`userId` là một cột `uuid` bình thường**, và ai cần người sở
 * hữu thì tự đi lấy — một câu hỏi nữa, nhưng là câu hỏi nhìn thấy được.
 *
 * `value` đã được CHUẨN HOÁ trước khi ghi: email hạ hết chữ thường, số điện
 * thoại đưa về E.164 (+84…). Chuẩn hoá là việc của service, không phải của
 * người dùng — họ gõ "  Nam@Gmail.Com " thì vẫn phải vào đúng một tài khoản.
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
