import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API, MSG } from '@nook/shared';
import { CurrentUser, Message, ApiErrors, ApiResult } from '../../../core/decorator/index.js';
import { UserProfileDto } from '../../../core/dto/user-profile.dto.js';
import type { IAuthUser } from '../../../core/interface/auth-user.interface.js';
import { UserService } from './user.service.js';
import { UsernameService } from './username.service.js';
import { UPDATE_ME_EXAMPLES, UpdateMeDto } from './user.dto.js';
import { UsernameCheckDto, UsernameQueryDto } from './username.dto.js';

/**
 * `@Controller()` để trống là cố ý: đường dẫn đầy đủ nằm ở `API` bên
 * `@nook/shared`, và cả app lẫn server đọc CÙNG một chuỗi. Không có global
 * prefix ở đây — thêm prefix là mở đường cho hai bên lệch nhau.
 */
@ApiTags('Người dùng')
@ApiBearerAuth('access-token')
@Controller()
export class UserController {
  constructor(
    private readonly users: UserService,
    private readonly usernames: UsernameService,
  ) {}

  @Get(API.user.me)
  @ApiOperation({ summary: 'Lấy hồ sơ của tôi' })
  @ApiResult(UserProfileDto)
  @ApiErrors(401, 404)
  getMe(@CurrentUser() me: IAuthUser): Promise<UserProfileDto> {
    return this.users.getProfile(me.id);
  }

  @Patch(API.user.updateMe)
  @Message(MSG.PROFILE_UPDATED)
  @ApiOperation({ summary: 'Sửa hồ sơ của tôi' })
  @ApiBody({ type: UpdateMeDto, examples: UPDATE_ME_EXAMPLES })
  @ApiResult(UserProfileDto)
  @ApiErrors(400, 401, 404)
  updateMe(@CurrentUser() me: IAuthUser, @Body() dto: UpdateMeDto): Promise<UserProfileDto> {
    return this.users.updateMe(me.id, dto);
  }

  /**
   * Hỏi một cái tên còn trống không.
   *
   * **App phải tự soi dạng trước khi gọi cửa này.** `checkUsernameShape` bên
   * `@nook/shared` chạy ngay trên máy, 0 mili giây, và bắt được phần lớn cái
   * sai: quá ngắn, có khoảng trắng, có emoji, trùng tên giữ chỗ. Chỉ tên đã
   * đúng dạng mới đáng đi một vòng mạng. Cộng thêm chờ ~300ms sau khi người ta
   * ngừng gõ thì một cái tên mười chữ chỉ tốn MỘT lần gọi, không phải mười.
   *
   * Phải đăng nhập mới gọi được — cửa này tra được cả kho tên, không có lý do
   * gì mở cho người lạ.
   */
  @Get(API.user.usernameCheck)
  @ApiOperation({ summary: 'Tên riêng này còn trống không' })
  @ApiResult(UsernameCheckDto)
  @ApiErrors(400, 401)
  checkUsername(@Query() q: UsernameQueryDto): Promise<UsernameCheckDto> {
    return this.usernames.check(q.username);
  }
}
