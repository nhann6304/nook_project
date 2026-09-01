import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { TStatKey } from '@nook/shared';

/**
 * DANH MỤC thành tích. Đây là bảng tra, không phải bảng của người dùng.
 *
 * Chỗ để mở rộng nằm ở đây: thêm một thành tích mới = **thêm một dòng**, không
 * sửa dòng mã nào. Bộ máy chỉ biết một luật duy nhất — "con đếm `metric` chạm
 * `threshold` thì mở, và mở thì cộng `extra_circle_slots` chỗ vào góc".
 *
 * `key` là khoá tra CHỮ ở app, không phải câu chữ. Server không bao giờ trả về
 * tiếng Việt.
 */
@Entity('achievements')
export class Achievement {
  /** Ví dụ 'circle.full_house'. Vừa là khoá chính, vừa là khoá tra chữ. */
  @PrimaryColumn({ name: 'key', type: 'varchar', length: 64 })
  key!: string;

  /** Con đếm mà nó canh. Xem `STAT` trong @nook/shared. */
  @Column({ name: 'metric', type: 'varchar', length: 32 })
  metric!: TStatKey;

  /** Chạm tới đâu thì mở. */
  @Column({ name: 'threshold', type: 'integer' })
  threshold!: number;

  /** Mở ra thì thêm mấy chỗ trong góc. 0 nghĩa là thành tích để ngắm. */
  @Column({ name: 'extra_circle_slots', type: 'integer', default: 0 })
  extraCircleSlots!: number;

  /** Thứ tự hiện ra ở app. */
  @Column({ name: 'sort', type: 'integer', default: 0 })
  sort!: number;

  /** Tắt một thành tích cũ mà không xoá lịch sử của ai. */
  @Column({ name: 'active', type: 'boolean', default: true })
  active!: boolean;
}
