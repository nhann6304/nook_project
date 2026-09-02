import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { LIMITS, type IUpdateMeBody } from '@nook/shared';

/**
 * Sửa hồ sơ. Mọi trường đều tuỳ chọn — gửi cái nào thì sửa cái đó.
 *
 * Khai TAY từng trường, KHÔNG suy ra từ một DTO khác bằng `PartialType`.
 * Suy ra thì trình biên dịch im lặng còn `forbidNonWhitelisted` lại chặn lúc
 * chạy, và câu lỗi "property … should not exist" không chỉ được ra chỗ sai.
 */
export class UpdateMeDto implements IUpdateMeBody {
  @ApiPropertyOptional({
    example: 'Nam',
    minLength: LIMITS.displayNameMin,
    maxLength: LIMITS.displayNameMax,
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(LIMITS.displayNameMin)
  @MaxLength(LIMITS.displayNameMax)
  displayName?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Id ảnh đã tải lên xong. Ảnh đi thẳng lên kho, cửa này chỉ trỏ vào nó.',
  })
  @IsOptional()
  @IsUUID()
  avatarMediaId?: string;
}
