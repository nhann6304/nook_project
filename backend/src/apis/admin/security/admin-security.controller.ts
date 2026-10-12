import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API, ROLE, type ICursorPage } from '@nook/shared';
import { ApiCursorResult, ApiErrors, Roles } from '../../../core/decorator/index.js';
import { CursorQueryDto } from '../../../core/dto/cursor.dto.js';
import { AdminSecurityService } from './admin-security.service.js';
import { AuthEventDto, UserDeviceDto } from './admin-security.dto.js';

@ApiTags('Quản trị')
@ApiBearerAuth('access-token')
@Roles(ROLE.admin, ROLE.root)
@Controller()
export class AdminSecurityController {
  constructor(private readonly security: AdminSecurityService) {}

  @Get(API.admin.userDevices)
  @ApiOperation({ summary: 'Các máy của một tài khoản' })
  @ApiCursorResult(UserDeviceDto)
  @ApiErrors(400, 401, 403, 404)
  devices(@Param('id', ParseUUIDPipe) id: string): Promise<ICursorPage<UserDeviceDto>> {
    return this.security.devicesOf(id);
  }

  @Get(API.admin.userAuthEvents)
  @ApiOperation({ summary: 'Sổ đăng nhập của một tài khoản' })
  @ApiCursorResult(AuthEventDto)
  @ApiErrors(400, 401, 403, 404)
  authEvents(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: CursorQueryDto,
  ): Promise<ICursorPage<AuthEventDto>> {
    return this.security.eventsOf(id, query);
  }
}
