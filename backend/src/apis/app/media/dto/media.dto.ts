import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, Max } from 'class-validator';
import {
  MEDIA_CONTENT_TYPES,
  MEDIA_KINDS,
  MEDIA_LIMITS,
  MEDIA_STATUSES,
  MEDIA_VARIANTS,
  type ICreateUploadBody,
  type ICreateUploadResult,
  type IMedia,
  type TMediaKind,
  type TMediaStatus,
  type TMediaVariant,
} from '@nook/shared';

export class CreateUploadDto implements ICreateUploadBody {
  @ApiProperty({ enum: MEDIA_KINDS, example: 'avatar' })
  @IsIn(MEDIA_KINDS)
  kind!: TMediaKind;

  @ApiProperty({ enum: MEDIA_CONTENT_TYPES, example: 'image/heic' })
  @IsIn(MEDIA_CONTENT_TYPES)
  contentType!: string;

  @ApiProperty({
    example: 4_812_233,
    maximum: MEDIA_LIMITS.maxBytes,
    description: 'Dung lượng THẬT. Kho từ chối nếu đẩy lên khác con số này.',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(MEDIA_LIMITS.maxBytes)
  byteSize!: number;

  @ApiPropertyOptional({ example: 4032, description: 'Chỉ để app dựng khung trước khi ảnh về' })
  @IsOptional() @Type(() => Number) @IsInt() @IsPositive()
  width?: number;

  @ApiPropertyOptional({ example: 3024 })
  @IsOptional() @Type(() => Number) @IsInt() @IsPositive()
  height?: number;
}

export class CreateUploadResultDto implements ICreateUploadResult {
  @ApiProperty({ format: 'uuid' })
  mediaId!: string;

  @ApiProperty({ description: 'PUT thẳng bytes vào đây — KHÔNG đi qua server' })
  uploadUrl!: string;

  @ApiProperty({
    example: { 'content-type': 'image/heic', 'content-length': '4812233' },
    description: 'Phải đính đúng mấy header này, không thì chữ ký không khớp',
  })
  headers!: Record<string, string>;

  @ApiProperty({ example: MEDIA_LIMITS.uploadUrlTtlSeconds })
  expiresInSeconds!: number;
}

export class MediaDto implements IMedia {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) ownerId!: string;
  @ApiProperty({ enum: MEDIA_KINDS }) kind!: TMediaKind;
  @ApiProperty({ enum: MEDIA_STATUSES }) status!: TMediaStatus;
  @ApiProperty({ example: 'image/heic' }) contentType!: string;
  @ApiProperty({ example: 4_812_233 }) byteSize!: number;
  @ApiProperty({ nullable: true, example: 4032 }) width!: number | null;
  @ApiProperty({ nullable: true, example: 3024 }) height!: number | null;

  @ApiProperty({
    example: '/v1/media/6f1b7a2e-0c3d-4a1f-9d8e-2b5c7a9f1e34',
    description: 'Đường của SERVER, không phải đường đã ký của kho — đường ký hết hạn sau vài phút',
  })
  url!: string;

  @ApiProperty({ format: 'date-time' }) createdAt!: string;

  @ApiProperty({
    example: { feed: '/v1/media/6f1b…?variant=feed', thumb: '/v1/media/6f1b…?variant=thumb' },
    description:
      'Bản nhẹ đã dựng xong. Thiếu bản nào thì cứ dùng `url` (bản gốc) — chậm hơn nhưng không bao giờ trống.',
  })
  variants!: Partial<Record<TMediaVariant, string>>;
}

/** Xin bản nào. Bỏ trống là bản gốc. */
export class ReadMediaQueryDto {
  @ApiPropertyOptional({ enum: MEDIA_VARIANTS })
  @IsOptional()
  @IsIn(MEDIA_VARIANTS)
  variant?: TMediaVariant;
}

export const CREATE_UPLOAD_EXAMPLES = {
  avatarJpeg: {
    summary: 'Ảnh đại diện, JPEG',
    value: { kind: 'avatar', contentType: 'image/jpeg', byteSize: 1_842_113, width: 1200, height: 1200 },
  },
  momentHeic: {
    summary: 'Khoảnh khắc, HEIC từ iPhone  (nhận thẳng, không phải chuyển)',
    value: { kind: 'moment', contentType: 'image/heic', byteSize: 4_812_233, width: 4032, height: 3024 },
  },
  tooLarge: {
    summary: 'Quá to  (bị chặn ngay từ lúc xin đường)',
    value: { kind: 'moment', contentType: 'image/jpeg', byteSize: 99_999_999 },
  },
} as const;
