import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API } from '@nook/shared';
import { CurrentUser } from '../../common/decorator/current-user.decorator.js';
import { ApiErrors } from '../../common/decorator/api-errors.decorator.js';
import { ApiResult } from '../../common/decorator/api-result.decorator.js';
import type { AuthUser } from '../../common/auth/auth.types.js';
import { AchievementService } from './achievement.service.js';
import { AchievementListDto } from './dto/achievement.dto.js';

@ApiTags('Thành tích')
@ApiBearerAuth('access-token')
@Controller()
export class AchievementController {
  constructor(private readonly achievements: AchievementService) {}

  @Get(API.achievement.mine)
  @ApiOperation({ summary: 'Thành tích của tôi' })
  @ApiResult(AchievementListDto)
  @ApiErrors(401)
  listMine(@CurrentUser() me: AuthUser): Promise<AchievementListDto> {
    return this.achievements.listMine(me.id);
  }
}
