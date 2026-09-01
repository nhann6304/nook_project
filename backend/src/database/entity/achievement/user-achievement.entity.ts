import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Ai đã mở được gì, lúc nào. **Chỉ ghi thêm, không sửa, không xoá.**
 *
 * Vì sao không xoá: người ta đạt được rồi thì đạt rồi. Bạn bớt đi một người
 * không làm mất thành tích "từng có đủ 10 người trong góc" — và cũng không làm
 * mất chỗ đã mở. Nếu lấy lại chỗ thì người dùng sẽ thấy góc mình tự co lại,
 * đó là một cách làm người ta giận rất nhanh.
 */
@Entity('user_achievements')
export class UserAchievement {
  @Index('idx_user_achievement_user')
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'achievement_key', type: 'varchar', length: 64 })
  achievementKey!: string;

  @Column({ name: 'unlocked_at', type: 'timestamptz', default: () => 'now()' })
  unlockedAt!: Date;

  /** Con đếm lúc mở. Để sau này còn dò lại được nếu ngưỡng bị chỉnh. */
  @Column({ name: 'value_at_unlock', type: 'integer' })
  valueAtUnlock!: number;
}
