import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../user/index.js';
import { Achievement } from './achievement.entity.js';

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
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'achievement_key', type: 'varchar', length: 64 })
  achievementKey!: string;

  @Index('idx_user_achievement_user')
  @ManyToOne(() => User, (user) => user.achievements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Achievement, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'achievement_key' })
  achievement!: Achievement;

  @Column({ name: 'unlocked_at', type: 'timestamptz', default: () => 'now()' })
  unlockedAt!: Date;

  /** Con đếm lúc mở. Để sau này còn dò lại được nếu ngưỡng bị chỉnh. */
  @Column({ name: 'value_at_unlock', type: 'integer' })
  valueAtUnlock!: number;
}
