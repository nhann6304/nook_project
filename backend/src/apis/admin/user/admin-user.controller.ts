import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API, ROLE, type ICursorPage } from '@nook/shared';
import { ApiCursorResult, ApiErrors, Roles } from '../../../core/decorator/index.js';
import { CursorQueryDto } from '../../../core/dto/cursor.dto.js';
import { AdminUserService } from './admin-user.service.js';
import { AdminUserDto } from './admin-user.dto.js';

@ApiTags('Quản trị')
@ApiBearerAuth('access-token')
@Roles(ROLE.admin, ROLE.root)
@Controller()
export class AdminUserController {
  constructor(private readonly users: AdminUserService) {}

  @Get(API.admin.users)
  @ApiOperation({ summary: 'Danh sách người dùng' })
  @ApiCursorResult(AdminUserDto)
  @ApiErrors(401, 403)
  list(@Query() query: CursorQueryDto): Promise<ICursorPage<AdminUserDto>> {
    return this.users.list(query);
  }
}
