import { Column, Entity } from 'typeorm';
import { SoftDeleteEntity } from '../base/index.js';

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
 * Kế thừa `SoftDeleteEntity`: người tự xoá tài khoản thì đánh dấu chứ không
 * mất. TypeORM tự thêm `WHERE deleted_at IS NULL` vào mọi câu `find`, nên
 * không tầng nào phải nhớ mà lọc.
 *
 * Không có `@OneToMany` trỏ ngược về bốn bảng con — xem ghi chú "Không dùng
 * quan hệ ORM" ở `user-identity.entity.ts`. Cần danh sách phiên của một người
 * thì hỏi kho phiên bằng `userId`, và câu hỏi đó nhìn là thấy.
 */
@Entity('users')
export class User extends SoftDeleteEntity {
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

}
