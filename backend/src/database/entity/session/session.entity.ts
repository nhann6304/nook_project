import { Column, Entity, Index } from 'typeorm';
import { AuditEntity } from '../base/index.js';

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
export class Session extends AuditEntity {
  @Index('idx_session_user')
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  /** argon2 của thẻ dài hạn. Đổi mỗi lần làm mới thẻ. */
  @Column({ name: 'refresh_hash', type: 'varchar', length: 255 })
  refreshHash!: string;

  /**
   * Dấu vân của thẻ dài hạn ĐỜI TRƯỚC, cùng lúc xoay.
   *
   * Hai cột này để chịu được chuyện xảy ra thật trên điện thoại: hai lệnh gọi
   * cùng dính 401 rồi cùng đi làm mới thẻ. Không có chúng thì lượt thứ hai cầm
   * thẻ vừa bị xoay, bị chấm là "thẻ bị chép", và người dùng bị đá ra khỏi app
   * chỉ vì mạng yếu.
   */
  @Column({ name: 'prev_refresh_hash', type: 'varchar', length: 255, nullable: true })
  prevRefreshHash!: string | null;

  @Column({ name: 'rotated_at', type: 'timestamptz', nullable: true })
  rotatedAt!: Date | null;

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
