import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdminStatsDto } from './stats.dto.js';

/**
 * Đếm cho trang thống kê.
 *
 * Viết SQL thô và gộp hết vào MỘT câu, cố ý: năm con số là năm lần đi về cơ sở
 * dữ liệu nếu tách ra, mà chúng luôn được hỏi cùng lúc. Gộp lại còn được thêm
 * một thứ — cả năm con số cùng chụp tại một thời điểm, không có chuyện con này
 * đếm trước con kia vài trăm mili giây rồi cộng lại thành một bức tranh không
 * có thật.
 */
@Injectable()
export class AdminStatsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async summary(): Promise<AdminStatsDto> {
    const [row] = await this.db.query<
      { users: string; new_today: string; onboarded: string; admins: string; live_sessions: string }[]
    >(`
      SELECT
        (SELECT count(*) FROM users WHERE deleted_at IS NULL)                             AS users,
        (SELECT count(*) FROM users WHERE deleted_at IS NULL
                                      AND created_at > now() - interval '24 hours')       AS new_today,
        (SELECT count(*) FROM users WHERE deleted_at IS NULL
                                      AND onboarded_at IS NOT NULL)                       AS onboarded,
        (SELECT count(*) FROM users WHERE deleted_at IS NULL
                                      AND role IN ('admin','root'))                       AS admins,
        (SELECT count(*) FROM sessions WHERE revoked_at IS NULL
                                         AND expires_at > now())                          AS live_sessions
    `);

    // Postgres trả `count(*)` dạng bigint, mà bigint qua driver là CHUỖI.
    // Quên `Number()` là ra `"12" + 1 = "121"` — sai mà không ai báo.
    return {
      users: Number(row?.users ?? 0),
      newUsersToday: Number(row?.new_today ?? 0),
      onboardedUsers: Number(row?.onboarded ?? 0),
      admins: Number(row?.admins ?? 0),
      liveSessions: Number(row?.live_sessions ?? 0),
    };
  }
}
