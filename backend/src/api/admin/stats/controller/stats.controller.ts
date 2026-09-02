import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API, ROLE } from '@nook/shared';
import { ApiErrors, ApiResult, Roles } from '../../../../core/decorator/index.js';
import { AdminStatsService } from '../service/index.js';
import { AdminStatsDto } from '../dto/index.js';

@ApiTags('Quản trị')
@ApiBearerAuth('access-token')
@Roles(ROLE.admin, ROLE.root)
@Controller()
export class AdminStatsController {
  constructor(private readonly stats: AdminStatsService) {}

  @Get(API.admin.stats)
  @ApiOperation({ summary: 'Số liệu tổng quan' })
  @ApiResult(AdminStatsDto)
  @ApiErrors(401, 403)
  summary(): Promise<AdminStatsDto> {
    return this.stats.summary();
  }
}
