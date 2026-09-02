import { HttpStatus, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import {
  ERR,
  checkUsernameShape,
  normalizeUsername,
  type IUsernameCheck,
} from '@nook/shared';
import { AppException } from '../../../../core/error/index.js';
import { UserRepository } from '../../../../repository/index.js';

/** Postgres báo trùng khoá bằng mã này. */
const UNIQUE_VIOLATION = '23505';

/**
 * Tên riêng: soi và giữ chỗ.
 *
 * ── Vì sao KHÔNG có lớp đệm nào ở đây ───────────────────────────────────────
 *
 * Câu hỏi đầu tiên phải là "có cần không", và đã đo:
 *
 *   Postgres, index duy nhất, 200.000 dòng   0,243 ms / lượt
 *   Redis SISMEMBER, cùng máy                0,380 ms / lượt
 *
 * Redis **chậm hơn**. Cả hai đều là một vòng gọi qua mạng, mà `Index Only Scan`
 * của Postgres không hề đọc tới bảng — nó đọc thẳng trên index. Nhét thêm một
 * lớp đệm vào đây là đổi một thứ ĐÚNG và NHANH lấy một thứ chậm hơn, có thể
 * lệch, và phải nuôi.
 *
 * Bộ lọc Bloom (thứ hay được nhắc tới) chỉ ăn tiền khi số tên tới hàng CHỤC
 * TRIỆU và bộ nhớ mới thành vấn đề: 10 triệu tên là ~700MB nếu để trong tập
 * Redis, còn Bloom thì ~12MB. Dưới vài triệu thì nó chỉ thêm việc.
 *
 * ── Chỗ thật sự làm việc gõ tên thấy nhanh ──────────────────────────────────
 *
 * Không nằm ở server. Nằm ở chỗ **app tự soi trước khi gọi**: quá ngắn, có
 * khoảng trắng, có emoji, trùng tên giữ chỗ — bắt hết bằng `checkUsernameShape`
 * của `@nook/shared`, ngay trên máy, **0 mili giây, 0 vòng mạng**. Chỉ tên đã
 * đúng dạng mới đáng đi hỏi server.
 *
 * Cộng thêm chờ khoảng 300ms sau khi người ta ngừng gõ, một cái tên 10 chữ chỉ
 * tốn MỘT lần gọi chứ không phải mười.
 */
@Injectable()
export class UsernameService {
  constructor(private readonly users: UserRepository) {}

  /** Tên này còn trống không. Soi dạng TRƯỚC — sai dạng thì khỏi hỏi bảng. */
  async check(raw: string): Promise<IUsernameCheck> {
    const key = normalizeUsername(raw);
    const problem = checkUsernameShape(raw);

    // Sai dạng thì không có lý do gì đi hỏi cơ sở dữ liệu.
    if (problem) return { key, available: false, problem };

    const taken = await this.users.usernameTaken(key);
    return { key, available: !taken, problem: taken ? ERR.USERNAME_TAKEN : null };
  }

  /**
   * Giữ chỗ một cái tên.
   *
   * **Không hỏi trước rồi mới ghi.** Giữa lúc hỏi và lúc ghi có một khe, và hai
   * người bấm chọn cùng lúc thì cả hai cùng nhận "còn trống". Ghi thẳng rồi bắt
   * lỗi trùng khoá là cách duy nhất không có khe — ràng buộc của cơ sở dữ liệu
   * làm trọng tài, không phải mã của mình.
   */
  async claim(userId: string, raw: string): Promise<{ username: string; usernameKey: string }> {
    const problem = checkUsernameShape(raw);
    if (problem) throw new AppException(problem, HttpStatus.BAD_REQUEST);

    const username = raw.trim();
    const usernameKey = normalizeUsername(raw);

    try {
      await this.users.update({ id: userId }, { username, usernameKey });
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string })?.code === UNIQUE_VIOLATION) {
        throw new AppException(ERR.USERNAME_TAKEN, HttpStatus.CONFLICT);
      }
      throw error;
    }

    return { username, usernameKey };
  }
}
