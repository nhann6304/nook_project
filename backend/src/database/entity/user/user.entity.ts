import { Column, Entity, Index, OneToMany, OneToOne, type Relation } from 'typeorm';
import { BaseEntity } from '../base/index.js';
// `import type` chứ không phải `import`. Xem ghi chú "Vòng tròn nhập khẩu" bên dưới.
import type { UserIdentity } from './user-identity.entity.js';
import type { Session } from '../session/index.js';
import type { UserStat } from './user-stat.entity.js';
import type { UserAchievement } from '../achievement/index.js';

/**
 * Người dùng.
 *
 * KHÔNG có cột `level` ở đây, và sẽ không bao giờ có. Cấp thân là chuyện của
 * một CẶP hai người, không phải thuộc tính của một người — nó nằm ở bảng
 * `friendships` (chặng sau). Luật sản phẩm: cấp thân chỉ hai người trong cặp
 * nhìn thấy.
 *
 * Cũng KHÔNG có email hay số điện thoại — chúng nằm ở `user_identities`, vì một
 * người có thể có cả hai, và sau này còn đổi được.
 *
 * ── Vòng tròn nhập khẩu ─────────────────────────────────────────────────────
 *
 * Bảng này là TRỤC: bốn bảng kia trỏ về nó, nó trỏ ngược lại cả bốn. Ở
 * CommonJS thì vòng tròn đó chạy được; ở ESM thì không — Node ném
 * `Cannot access 'User' before initialization` ngay lúc nạp, trước khi có một
 * dòng nào chạy.
 *
 * Cách gỡ: phía trục dùng `import type` (biến mất lúc dịch, nên không tạo vòng)
 * cộng với TÊN BẢNG dạng chuỗi trong decorator, và bọc kiểu bằng `Relation<>`
 * để `emitDecoratorMetadata` đừng nhắc tới lớp kia. Bốn bảng con vẫn nhập
 * `User` bình thường — một chiều thì không thành vòng.
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'display_name', type: 'varchar', length: 24, nullable: true })
  displayName!: string | null;

  /**
   * Khoá của ảnh trong kho, KHÔNG phải đường dẫn đầy đủ.
   * Đường dẫn được ký lúc trả về và hết hạn sau vài phút — lưu sẵn là lưu một
   * thứ hỏng trong vài phút nữa.
   */
  @Column({ name: 'avatar_key', type: 'varchar', length: 255, nullable: true })
  avatarKey!: string | null;

  /** Đã qua màn Tên + ảnh chưa. `null` là chưa. */
  @Column({ name: 'onboarded_at', type: 'timestamptz', nullable: true })
  onboardedAt!: Date | null;

  /**
   * Độ lệch múi giờ của người này so với UTC, tính bằng phút. Việt Nam là 420.
   *
   * Server CẦN con số này: trần "3 ký ức một ngày" và chuỗi ngày liền nhau đều
   * tính theo ngày mà người dùng đang sống, không phải ngày của máy chủ.
   */
  @Column({ name: 'tz_offset_minutes', type: 'smallint', default: 420 })
  tzOffsetMinutes!: number;

  /** 'vi' hoặc 'en'. Chỉ dùng để chọn tiếng cho thông báo đẩy. */
  @Column({ name: 'locale', type: 'varchar', length: 8, nullable: true })
  locale!: string | null;

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  /** Người dùng tự xoá tài khoản. Cửa đăng nhập phải từ chối dòng có cột này. */
  @Index('idx_users_deleted_at')
  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @OneToMany('UserIdentity', 'user')
  identities!: Relation<UserIdentity[]>;

  @OneToMany('Session', 'user')
  sessions!: Relation<Session[]>;

  @OneToOne('UserStat', 'user')
  stat!: Relation<UserStat> | null;

  @OneToMany('UserAchievement', 'user')
  achievements!: Relation<UserAchievement[]>;
}
