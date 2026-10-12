import { HttpStatus, Injectable } from '@nestjs/common';
import { ERR, type ICursorPage } from '@nook/shared';
import { AppException } from '../../../core/error/index.js';
import { CursorQueryDto } from '../../../core/dto/cursor.dto.js';
import {
  AuthEventRepository,
  UserDeviceRepository,
  UserRepository,
} from '../../../repository/index.js';
import { AuthEventMapper, UserDeviceMapper } from './admin-security.mapper.js';
import { AuthEventDto, UserDeviceDto } from './admin-security.dto.js';

/** Mỗi người chỉ vài máy; trần này chỉ để một tài khoản bất thường không kéo cả bảng. */
const DEVICES_MAX = 100;

/**
 * Máy và sổ đăng nhập của MỘT tài khoản, cho web quản trị soi khi có báo bị
 * chiếm tài khoản. Không có gì về bạn bè hay cấp thân ở đây — và không được có.
 */
@Injectable()
export class AdminSecurityService {
  constructor(
    private readonly users: UserRepository,
    private readonly devices: UserDeviceRepository,
    private readonly events: AuthEventRepository,
    private readonly deviceMapper: UserDeviceMapper,
    private readonly eventMapper: AuthEventMapper,
  ) {}

  /** Máy dùng gần nhất trước. Trả cùng hình dạng trang để web đọc một kiểu. */
  async devicesOf(userId: string): Promise<ICursorPage<UserDeviceDto>> {
    await this.assertUser(userId);
    const rows = await this.devices.listOf(userId, DEVICES_MAX);
    return { items: this.deviceMapper.toDtoList(rows), nextCursor: null };
  }

  async eventsOf(userId: string, query: CursorQueryDto): Promise<ICursorPage<AuthEventDto>> {
    await this.assertUser(userId);
    const { items, nextCursor } = await this.events.pageByCursor(
      { cursor: query.cursor, limit: query.limit },
      { userId },
    );
    return { items: this.eventMapper.toDtoList(items), nextCursor };
  }

  /** Người đã xoá mềm vẫn soi được — lịch sử của họ là thứ đáng soi nhất. */
  private async assertUser(userId: string): Promise<void> {
    const user = await this.users.findById(userId, { withDeleted: true, select: { id: true } });
    if (!user) throw new AppException(ERR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}
