import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../../database/repository/base.repository.js';
import { UserAchievement } from '../../../database/entity/index.js';

@Injectable()
export class UserAchievementRepository extends BaseRepository<UserAchievement> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, UserAchievement);
  }

  listByUser(userId: string): Promise<UserAchievement[]> {
    return this.find({ where: { userId } });
  }

  /**
   * Ghi những thành tích vừa mở. Trùng thì bỏ qua, không ném.
   *
   * Hai việc chạy song song cùng làm con đếm chạm ngưỡng thì cả hai cùng thấy
   * "vừa mở được" — khoá chính đôi `(user_id, achievement_key)` chặn ghi hai
   * lần, và `DO NOTHING` biến cú đụng đó thành chuyện bình thường thay vì lỗi.
   */
  async unlockMany(
    userId: string,
    rows: { key: string; value: number }[],
  ): Promise<string[]> {
    if (rows.length === 0) return [];

    const values = rows.map((_r, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(', ');
    const params: (string | number)[] = [userId];
    for (const row of rows) params.push(row.key, row.value);

    const inserted: { achievement_key: string }[] = await this.manager.query(
      `INSERT INTO "user_achievements" ("user_id", "achievement_key", "value_at_unlock")
       VALUES ${values}
       ON CONFLICT ("user_id", "achievement_key") DO NOTHING
       RETURNING "achievement_key"`,
      params,
    );
    return inserted.map((r) => r.achievement_key);
  }

  /**
   * Cộng LẠI tổng chỗ mở thêm, bằng `SUM` trên bảng.
   *
   * Không cộng dồn `+= n`. Cộng dồn thì sai một lần là sai mãi mãi, và không ai
   * biết nó bắt đầu sai từ hôm nào. Tính lại từ đầu thì tệ nhất cũng chỉ tốn
   * một câu truy vấn.
   */
  async recomputeExtraSlots(userId: string): Promise<number> {
    const rows: { total: string | null }[] = await this.manager.query(
      `UPDATE "user_stats" SET
         "extra_circle_slots" = COALESCE((
           SELECT SUM(a."extra_circle_slots")
           FROM "user_achievements" ua
           JOIN "achievements" a ON a."key" = ua."achievement_key"
           WHERE ua."user_id" = $1
         ), 0),
         "updated_at" = now()
       WHERE "user_id" = $1
       RETURNING "extra_circle_slots" AS "total"`,
      [userId],
    );
    return Number(rows[0]?.total ?? 0);
  }
}
