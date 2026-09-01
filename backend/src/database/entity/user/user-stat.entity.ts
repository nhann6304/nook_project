import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Những con đếm mà thành tích canh chừng. Một dòng cho một người.
 *
 * **Đây là bảng suy ra được, không phải nguồn sự thật.** Sự thật nằm ở bảng
 * `events` (chặng sau) — bảng chỉ-ghi-thêm. Mọi con số ở đây phải dựng lại
 * được từ đó. Cần vậy vì đọc thì đọc suốt, còn tính lại thì tốn.
 *
 * Luật sản phẩm: bảng này **riêng tư**. Không có đường API nào trả con đếm của
 * người khác. Không bảng xếp hạng.
 */
@Entity('user_stats')
export class UserStat {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  /** Số người đang ở trong góc. */
  @Column({ name: 'friend_count', type: 'integer', default: 0 })
  friendCount!: number;

  /** Số khoảnh khắc đã đăng. */
  @Column({ name: 'moment_count', type: 'integer', default: 0 })
  momentCount!: number;

  /** Tổng ký ức cộng lại từ mọi cặp bạn. */
  @Column({ name: 'memory_total', type: 'integer', default: 0 })
  memoryTotal!: number;

  /** Chuỗi ngày liền nhau có ít nhất một ký ức. */
  @Column({ name: 'day_streak', type: 'integer', default: 0 })
  dayStreak!: number;

  /** Khoá ngày cuối cùng đã tính vào chuỗi, dạng 'YYYY-MM-DD' theo giờ NGƯỜI DÙNG. */
  @Column({ name: 'streak_day_key', type: 'varchar', length: 10, nullable: true })
  streakDayKey!: string | null;

  /**
   * Tổng chỗ mở thêm được, cộng sẵn từ `user_achievements`.
   * Cũng là con số suy ra được — giữ ở đây để khỏi phải cộng lại mỗi lần mở góc.
   */
  @Column({ name: 'extra_circle_slots', type: 'integer', default: 0 })
  extraCircleSlots!: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
