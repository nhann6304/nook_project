import { Column, Entity, Index } from 'typeorm';
import { ROLE, type TUserRole } from '@nook/shared';
import { SoftDeleteEntity } from '../base/index.js';

/**
 * Người dùng.
 *
 * KHÔNG bao giờ có cột `level`: cấp thân thuộc về một CẶP, không phải một
 * người — nó ở bảng `friendships`. Email/số điện thoại ở `user_identities`,
 * vì một người có thể có cả hai và còn đổi được.
 */
@Entity('users')
export class User extends SoftDeleteEntity {
  /** Vai trong hệ thống, không bao giờ hiện ra app. Chỉ gác cửa trang quản trị. */
  @Column({ name: 'role', type: 'varchar', length: 16, default: ROLE.member })
  role!: TUserRole;

  /** Đúng như người ta gõ, chỉ để HIỆN. `null` cho tới khi họ chọn. */
  @Column({ name: 'username', type: 'varchar', length: 20, nullable: true })
  username!: string | null;

  /**
   * Dạng chuẩn của tên riêng — cột MANG ràng buộc duy nhất.
   *
   * Hai cột chứ không phải một: nếu chỉ có `username` thì `Nam`, `nam` và `NAM`
   * là ba tên khác nhau, và người ta lấy được tên của nhau chỉ bằng cách đổi
   * chữ hoa chữ thường. Xem `normalizeUsername` bên `@nook/shared`.
   */
  @Index('uq_users_username_key', { unique: true })
  @Column({ name: 'username_key', type: 'varchar', length: 20, nullable: true })
  usernameKey!: string | null;

  @Column({ name: 'display_name', type: 'varchar', length: 24, nullable: true })
  displayName!: string | null;

  /**
   * Trỏ vào bảng `media`, KHÔNG phải một chuỗi đường dẫn.
   *
   * Chuỗi đường dẫn không nói được ảnh đã tải xong chưa, nặng bao nhiêu, ai tải
   * lên. Và đường dẫn ĐÃ KÝ thì hết hạn sau vài phút — lưu sẵn là lưu một thứ
   * hỏng trong vài phút nữa.
   */
  @Column({ name: 'avatar_media_id', type: 'uuid', nullable: true })
  avatarMediaId!: string | null;

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
