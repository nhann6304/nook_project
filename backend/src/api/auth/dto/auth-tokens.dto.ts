import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';
import type { IAuthTokens, ILogoutBody, IRefreshBody, TRefreshResult } from '@nook/shared';

export class AuthTokensDto implements IAuthTokens {
  @ApiProperty({ description: 'Đính vào mỗi lần gọi, sống ngắn' })
  accessToken!: string;

  @ApiProperty({ description: 'Cất trong kho an toàn của máy, chỉ dùng để đổi thẻ mới' })
  refreshToken!: string;

  @ApiProperty({ example: 900, description: 'Thẻ ngắn hạn sống bao lâu, tính bằng giây' })
  expiresInSeconds!: number;
}

/** Kết quả làm mới đúng bằng kết quả phát thẻ. Giữ tên riêng cho Swagger dễ đọc. */
export class RefreshResultDto extends AuthTokensDto implements TRefreshResult {}

export class RefreshDto implements IRefreshBody {
  @ApiProperty({ description: 'Thẻ dài hạn đang giữ' })
  @IsString()
  @IsJWT()
  refreshToken!: string;
}

export class LogoutDto implements ILogoutBody {
  @ApiProperty({ description: 'Thẻ dài hạn của chính phiên muốn thu hồi' })
  @IsString()
  @IsJWT()
  refreshToken!: string;
}
