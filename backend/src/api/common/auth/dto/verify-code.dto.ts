import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  LIMITS,
  type TSignInMethod,
  type IVerifyCodeBody,
  type IVerifyCodeResult,
} from '@nook/shared';
import { UserProfileDto } from '../../dto/index.js';
import { AuthTokensDto } from './auth-tokens.dto.js';

export class VerifyCodeDto implements IVerifyCodeBody {
  @ApiProperty({ enum: ['email', 'phone'], example: 'email' })
  @IsIn(['email', 'phone'])
  method!: TSignInMethod;

  @ApiProperty({ example: 'nam@gmail.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(320)
  target!: string;

  @ApiProperty({ example: '123456', minLength: LIMITS.codeLength, maxLength: LIMITS.codeLength })
  @IsString()
  @Length(LIMITS.codeLength, LIMITS.codeLength)
  @Matches(/^\d+$/)
  code!: string;

  // Ba trường dưới đây KHÔNG nằm trong `IVerifyCodeBody` của @nook/shared, và
  // đó là chủ ý: chúng chỉ để ghi vào sổ phiên cho người dùng biết máy nào đang
  // đăng nhập. App có gửi thì tốt, không gửi cũng chạy.
  @ApiProperty({ required: false, example: 'iPhone của Nam' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  deviceName?: string;

  @ApiProperty({ required: false, enum: ['ios', 'android', 'web'] })
  @IsOptional()
  @IsIn(['ios', 'android', 'web'])
  platform?: string;

  @ApiProperty({ required: false, example: '0.1.0' })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  appVersion?: string;
}

export class VerifyCodeResultDto extends AuthTokensDto implements IVerifyCodeResult {
  @ApiProperty({ example: true, description: 'Vừa mở tài khoản lần đầu' })
  isNew!: boolean;

  @ApiProperty({ type: UserProfileDto })
  user!: UserProfileDto;
}
