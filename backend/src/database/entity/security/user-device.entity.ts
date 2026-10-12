import { Column, Entity, Unique } from 'typeorm';
import { UuidEntity } from '../base/index.js';

/**
 * Một máy từng đăng nhập THÀNH CÔNG vào một tài khoản. Khoá theo
 * `(user_id, device_id)` — `device_id` là UUID app tự sinh, cài lại app là máy mới.
 *
 * Thư mục `security/` riêng chứ không nằm trong `user/` hay `session/`: bảng
 * riêng, sống lâu hơn phiên (phiên thu hồi rồi máy vẫn là máy quen), và web
 * quản trị có màn riêng cho nó — hai câu "có" trở lên.
 *
 * `model`/`os`/`app_version` là lời app TỰ KHAI. Không cột nào ở đây được
 * dùng để cấp quyền.
 */
@Entity('user_devices')
@Unique('uq_user_device', ['userId', 'deviceId'])
export class UserDevice extends UuidEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'device_id', type: 'uuid' })
  deviceId!: string;

  @Column({ name: 'model', type: 'varchar', length: 64, nullable: true })
  model!: string | null;

  @Column({ name: 'os', type: 'varchar', length: 64, nullable: true })
  os!: string | null;

  @Column({ name: 'app_version', type: 'varchar', length: 64, nullable: true })
  appVersion!: string | null;

  /**
   * Lần đầu người dùng nhập đúng MÃ trên máy này (tạo tài khoản, đặt lại mật
   * khẩu, đăng nhập bằng mã). Chỉ mật khẩu thì KHÔNG đủ để thành máy tin cậy.
   */
  @Column({ name: 'trusted_at', type: 'timestamptz', nullable: true })
  trustedAt!: Date | null;

  @Column({ name: 'first_ip', type: 'varchar', length: 64, nullable: true })
  firstIp!: string | null;

  @Column({ name: 'first_country', type: 'char', length: 2, nullable: true })
  firstCountry!: string | null;

  @Column({ name: 'last_ip', type: 'varchar', length: 64, nullable: true })
  lastIp!: string | null;

  @Column({ name: 'last_country', type: 'char', length: 2, nullable: true })
  lastCountry!: string | null;

  @Column({ name: 'first_seen_at', type: 'timestamptz' })
  firstSeenAt!: Date;

  @Column({ name: 'last_seen_at', type: 'timestamptz' })
  lastSeenAt!: Date;
}
