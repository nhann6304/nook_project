import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { LIMITS, USERNAME_LIMITS, type IUpdateMeBody } from '@nook/shared';

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

  @ApiPropertyOptional({
    example: 'namnguyen',
    minLength: USERNAME_LIMITS.usernameMin,
    maxLength: USERNAME_LIMITS.usernameMax,
    description: 'Tên riêng, duy nhất cả hệ thống. Hỏi trước bằng /v1/username/check.',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username?: string;
}

export const UPDATE_ME_EXAMPLES = {
  name: { summary: 'Chỉ đổi tên', value: { displayName: 'Nam' } },
  avatar: {
    summary: 'Chỉ đổi ảnh đại diện  (ảnh phải tải lên xong trước)',
    value: { avatarMediaId: '6f1b7a2e-0c3d-4a1f-9d8e-2b5c7a9f1e34' },
  },
  both: {
    summary: 'Đổi cả hai',
    value: { displayName: 'Nam', avatarMediaId: '6f1b7a2e-0c3d-4a1f-9d8e-2b5c7a9f1e34' },
  },
} as const;
