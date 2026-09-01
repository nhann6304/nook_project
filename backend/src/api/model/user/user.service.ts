import { HttpStatus, Injectable } from '@nestjs/common';
import { ERR, type SignInMethod } from '@nook/shared';
import { AppException } from '../../common/error/app.exception.js';
import { UserProfileDto } from '../../common/dto/user-profile.dto.js';
import { Transactional } from '../../../database/transaction/transactional.decorator.js';
import { User } from '../../../database/entity/index.js';
import { UserRepository } from './user.repository.js';
import { UserIdentityRepository } from './user-identity.repository.js';
import { UserStatRepository } from './user-stat.repository.js';
import { UserMapper } from './user.mapper.js';
import type { UpdateMeDto } from './dto/update-me.dto.js';

/** Ném ra khi thua cuộc đua mở tài khoản. Không rời khỏi file này. */
class IdentityRaceLost extends Error {}

/**
 * Dịch vụ chỉ làm MỘT việc: xếp thứ tự và quyết định.
 *
 * Không có câu truy vấn nào ở đây — truy vấn nằm ở kho. Không có phép nắn nào
 * ở đây — nắn nằm ở bộ nắn. Giữ được ranh giới đó thì đọc một dịch vụ là đọc
 * được LUẬT, không phải lội qua SQL để đoán ra luật.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly identities: UserIdentityRepository,
    private readonly stats: UserStatRepository,
    private readonly mapper: UserMapper,
  ) {}

  /** Hồ sơ của chính mình. */
  async getProfile(userId: string): Promise<UserProfileDto> {
    return this.mapper.toDto(await this.mustFind(userId));
  }

  /**
   * Sửa hồ sơ.
   *
   * Lần đầu đặt được tên là lúc đóng dấu `onboarded_at`. App dựa vào dấu đó để
   * biết còn phải đưa người ta qua màn Tên + ảnh nữa không — chứ không dựa vào
   * `displayName != null`, vì sau này cho đổi tên về rỗng là cờ kia sai ngay.
   */
  @Transactional()
  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserProfileDto> {
    const user = await this.mustFind(userId);

    if (dto.displayName !== undefined) {
      const name = dto.displayName.trim();
      if (name.length === 0) throw new AppException(ERR.NAME_INVALID, HttpStatus.BAD_REQUEST);
      user.displayName = name;
      user.onboardedAt ??= new Date();
    }

    return this.mapper.toDto(await this.users.save(user));
  }

  /**
   * Tìm người theo đích đăng nhập, chưa có thì mở tài khoản.
   *
   * Chỗ này là ví dụ đầy đủ nhất về cách giao dịch chạy trong dự án — đọc nó
   * trước khi viết cái thứ hai giống nó.
   *
   * Cuộc đua có thật: người dùng bấm "Gửi lại", nhận hai mã, nộp gần như cùng
   * lúc từ hai màn. Hai giao dịch cùng thấy "chưa có tài khoản", cùng đi tạo.
   * Ràng buộc UNIQUE ở `(kind, value)` là thứ duy nhất chặn được, nên bên thua
   * phải NHƯỜNG rồi đọc lại. Một lần thử lại là đủ: lần hai chắc chắn rơi vào
   * nhánh "đã có", vì bên kia đã ghi xong.
   */
  async findOrCreateByIdentity(
    kind: SignInMethod,
    value: string,
  ): Promise<{ user: User; isNew: boolean }> {
    try {
      return await this.attachOrCreate(kind, value);
    } catch (error) {
      if (!(error instanceof IdentityRaceLost)) throw error;
      // Giao dịch của mình đã cuộn lại, dòng `users` vừa tạo biến mất theo —
      // không để lại tài khoản rác. Bên kia thì đã ghi xong, đọc lại là thấy.
      return this.attachOrCreate(kind, value);
    }
  }

  @Transactional()
  private async attachOrCreate(
    kind: SignInMethod,
    value: string,
  ): Promise<{ user: User; isNew: boolean }> {
    const existing = await this.identities.findWithUser(kind, value);

    if (existing) {
      if (existing.user.deletedAt !== null) {
        // Đã tự xoá tài khoản thì không hồi sinh bằng một lần đăng nhập.
        throw new AppException(ERR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      await this.identities.markVerified(existing.id);
      return { user: existing.user, isNew: false };
    }

    const user = await this.users.create({});
    await this.stats.create({ userId: user.id });

    const identity = await this.identities.insertIfAbsent(user.id, kind, value);
    if (identity === null) throw new IdentityRaceLost();

    return { user, isNew: true };
  }

  private async mustFind(userId: string): Promise<User> {
    const user = await this.users.findAlive(userId);
    if (!user) throw new AppException(ERR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    return user;
  }
}
