import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from '../../../../database/transaction/index.js';
import { UserStatRepository } from '../../user/repository/index.js';
import { AchievementRepository, UserAchievementRepository } from '../repository/index.js';
import { AchievementMapper } from '../mapper/index.js';
import { AchievementListDto } from '../dto/index.js';

/** Tên cột trong bảng đếm, tra theo tên con đếm. Dùng cho phần chấm ngưỡng. */
const VALUE_OF = {
  friend_count: (s: { friendCount: number }) => s.friendCount,
  moment_count: (s: { momentCount: number }) => s.momentCount,
  memory_total: (s: { memoryTotal: number }) => s.memoryTotal,
  day_streak: (s: { dayStreak: number }) => s.dayStreak,
} as const;

/**
 * Thành tích — thứ mở thêm chỗ trong góc bạn bè.
 *
 * Luật gọn trong một câu: **con đếm chạm ngưỡng thì thành tích mở, và mở thì
 * cộng thêm mấy chỗ vào góc.** Chỉ có đúng một luật đó cho MỌI thành tích —
 * nên thêm cái mới là thêm một DÒNG trong bảng `achievements`, không phải viết
 * thêm mã. Đó là chỗ để lớn lên sau này.
 *
 * Ba từ *điểm*, *hạng*, *nhiệm vụ* không có ở đây và cũng không được có ở app.
 * Server trả về KHOÁ, app tự chọn chữ.
 *
 * Riêng tư: không đường nào trả thành tích của người khác. Không bảng xếp hạng,
 * và cũng đừng dựng bảng tổng để rồi lộ ra ở một cửa nào đó.
 */
@Injectable()
export class AchievementService {
  private readonly log = new Logger('Achievement');

  constructor(
    private readonly catalog: AchievementRepository,
    private readonly unlocked: UserAchievementRepository,
    private readonly stats: UserStatRepository,
    private readonly mapper: AchievementMapper,
  ) {}

  /** Thành tích của chính mình, kèm sức chứa của góc. */
  async listMine(userId: string): Promise<AchievementListDto> {
    const [rows, mine, stat] = await Promise.all([
      this.catalog.listActive(),
      this.unlocked.listByUser(userId),
      this.stats.findByUser(userId),
    ]);

    const unlockedAt = new Map(mine.map((row) => [row.achievementKey, row.unlockedAt]));

    return {
      circle: this.mapper.toCircle(stat),
      items: this.mapper.toItemList(rows, { stat, unlockedAt }),
    };
  }

  /**
   * Chấm lại xem có gì vừa mở được không. Trả về khoá của những cái vừa mở.
   *
   * Gọi sau mỗi lần một con đếm nhúc nhích — kết bạn xong, đăng ảnh xong, cộng
   * ký ức xong. Cả ba bước nằm trong MỘT giao dịch: không có trạng thái "đã ghi
   * thành tích mà chưa cộng chỗ", vì cái trạng thái đó sẽ làm góc của người ta
   * chật hơn thực tế và không ai hiểu vì sao.
   *
   * Chưa có gì gọi tới hàm này — chặng 3, lúc có góc bạn bè và ký ức thật.
   */
  @Transactional()
  async evaluate(userId: string): Promise<string[]> {
    const stat = await this.stats.findByUser(userId);
    if (!stat) return [];

    const [rows, mine] = await Promise.all([
      this.catalog.listActive(),
      this.unlocked.listByUser(userId),
    ]);

    const already = new Set(mine.map((row) => row.achievementKey));
    const reached = rows
      .filter((row) => !already.has(row.key))
      .map((row) => ({ key: row.key, value: VALUE_OF[row.metric](stat), threshold: row.threshold }))
      .filter((row) => row.value >= row.threshold)
      .map(({ key, value }) => ({ key, value }));

    if (reached.length === 0) return [];

    const opened = await this.unlocked.unlockMany(userId, reached);
    if (opened.length > 0) await this.unlocked.recomputeExtraSlots(userId);

    this.log.debug({ userId, opened }, 'achievements unlocked');
    return opened;
  }
}
