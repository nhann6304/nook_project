import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API, MSG } from '@nook/shared';
import { CurrentUser } from '../../common/decorator/current-user.decorator.js';
import { Message } from '../../common/decorator/message.decorator.js';
import { ApiErrors } from '../../common/decorator/api-errors.decorator.js';
import { ApiResult } from '../../common/decorator/api-result.decorator.js';
import { UserProfileDto } from '../../common/dto/user-profile.dto.js';
import type { AuthUser } from '../../common/auth/auth.types.js';
import { UserService } from './user.service.js';
import { UpdateMeDto } from './dto/update-me.dto.js';

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
  getMe(@CurrentUser() me: AuthUser): Promise<UserProfileDto> {
    return this.users.getProfile(me.id);
  }

  @Patch(API.user.updateMe)
  @Message(MSG.PROFILE_UPDATED)
  @ApiOperation({ summary: 'Sửa hồ sơ của tôi' })
  @ApiResult(UserProfileDto)
  @ApiErrors(400, 401, 404)
  updateMe(@CurrentUser() me: AuthUser, @Body() dto: UpdateMeDto): Promise<UserProfileDto> {
    return this.users.updateMe(me.id, dto);
  }
}
