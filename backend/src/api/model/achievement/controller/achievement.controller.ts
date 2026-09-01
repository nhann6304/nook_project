import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API } from '@nook/shared';
import { CurrentUser, ApiErrors, ApiResult } from '../../../common/decorator/index.js';
import type { IAuthUser } from '../../../common/auth/interface/index.js';
import { AchievementService } from '../service/index.js';
import { AchievementListDto } from '../dto/index.js';

@ApiTags('Thành tích')
@ApiBearerAuth('access-token')
@Controller()
export class AchievementController {
  constructor(private readonly achievements: AchievementService) {}

  @Get(API.achievement.mine)
  @ApiOperation({ summary: 'Thành tích của tôi' })
  @ApiResult(AchievementListDto)
  @ApiErrors(401)
  listMine(@CurrentUser() me: IAuthUser): Promise<AchievementListDto> {
    return this.achievements.listMine(me.id);
  }
}
