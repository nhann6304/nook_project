import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API, MSG } from '@nook/shared';
import { CurrentUser, Message, ApiErrors, ApiResult } from '../../../common/decorator/index.js';
import { UserProfileDto } from '../../../common/dto/index.js';
import type { IAuthUser } from '../../../common/auth/interface/index.js';
import { UserService } from '../service/index.js';
import { UpdateMeDto } from '../dto/index.js';

/**
 * `@Controller()` để trống là cố ý: đường dẫn đầy đủ nằm ở `API` bên
 * `@nook/shared`, và cả app lẫn server đọc CÙNG một chuỗi. Không có global
 * prefix ở đây — thêm prefix là mở đường cho hai bên lệch nhau.
 */
@ApiTags('Người dùng')
@ApiBearerAuth('access-token')
@Controller()
export class UserController {
  constructor(private readonly users: UserService) {}

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
  @ApiResult(UserProfileDto)
  @ApiErrors(400, 401, 404)
  updateMe(@CurrentUser() me: IAuthUser, @Body() dto: UpdateMeDto): Promise<UserProfileDto> {
    return this.users.updateMe(me.id, dto);
  }
}
