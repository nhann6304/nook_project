import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { LIMITS, type SendCodeBody, type SendCodeResult, type SignInMethod } from '@nook/shared';

/**
 * `implements SendCodeBody` là chỗ mấu chốt.
 *
 * Sửa `SendCodeBody` bên `@nook/shared` mà quên sửa ở đây thì **backend không
 * biên dịch được**. Đó là cách duy nhất biến một type — thứ tan biến lúc chạy —
 * thành một hợp đồng có răng.
 */
export class SendCodeDto implements SendCodeBody {
  @ApiProperty({ enum: ['email', 'phone'], example: 'email' })
  @IsIn(['email', 'phone'])
  method!: SignInMethod;

  @ApiProperty({ example: 'nam@gmail.com', description: 'Email hoặc số điện thoại' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(320)
  target!: string;
}

export class SendCodeResultDto implements SendCodeResult {
  @ApiProperty({ example: LIMITS.codeResendSeconds, description: 'Chờ bấy nhiêu giây mới xin được mã nữa' })
  retryAfterSeconds!: number;

  @ApiProperty({ example: LIMITS.codeTtlSeconds })
  expiresInSeconds!: number;

  @ApiProperty({ example: LIMITS.codeLength })
  codeLength!: number;
}
