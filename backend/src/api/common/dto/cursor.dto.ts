import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import type { ICursorPage, ICursorQuery } from '@nook/shared';

/** Trần cứng. Không ai được xin 10.000 tấm ảnh trong một lần gọi. */
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

/**
 * Lật trang bằng CON TRỎ, không bằng số trang.
 *
 * Bảng tin là dòng chảy: người ta đang cuộn thì có ảnh mới chen lên đầu. Với
 * `?page=2` thì mấy tấm ở ranh giới hoặc bị nhảy qua, hoặc hiện hai lần — và
 * không ai báo lỗi, người dùng chỉ thấy app "hơi kỳ".
 */
export class CursorQueryDto implements ICursorQuery {
  @ApiPropertyOptional({ description: 'Lấy từ trang trước. Bỏ trống là lấy từ đầu.' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  cursor?: string;

  @ApiPropertyOptional({ default: DEFAULT_LIMIT, minimum: 1, maximum: MAX_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit: number = DEFAULT_LIMIT;
}

/**
 * Chỉ để Swagger vẽ. Hình dạng thật do `@ApiCursorResult(Dto)` ghép vào.
 */
export class CursorPageDto<T = unknown> implements ICursorPage<T> {
  @ApiHideProperty()
  items!: T[];

  @ApiProperty({
    nullable: true,
    description: '`null` là hết. Có giá trị thì đưa lại vào `cursor` để lấy tiếp.',
  })
  nextCursor!: string | null;
}
