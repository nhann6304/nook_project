import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HEALTH_PATH } from '@nook/shared';
import { Public, ApiResult } from '../../core/decorator/index.js';
import { RedisService } from '../../infra/redis/service/redis.service.js';
import { HealthDto } from './health.dto.js';

/**
 * Dò sống chết. Không cần thẻ, không nằm trong `/v1`.
 *
 * Nó **thật sự chạm vào** Postgres và Redis chứ không chỉ trả `{ ok: true }`.
 * Một server còn thở nhưng mất kết nối cơ sở dữ liệu vẫn là một server hỏng —
 * và cái loại hỏng đó là loại người ta phát hiện ra muộn nhất.
 */
@ApiTags('Hệ thống')
@Controller()
export class HealthController {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get(HEALTH_PATH)
  @ApiOperation({ summary: 'Dò sống chết' })
  @ApiResult(HealthDto)
  async check(): Promise<HealthDto> {
    const [db, redis] = await Promise.all([this.pingDb(), this.redis.ping()]);
    return { ok: db && redis, db, redis, uptimeSeconds: Math.round(process.uptime()) };
  }

  private async pingDb(): Promise<boolean> {
    try {
      await this.db.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
