import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { LIMITS, type ISendCodeBody, type ISendCodeResult, type TSignInMethod } from '@nook/shared';

/**
 * `implements ISendCodeBody` là chỗ mấu chốt.
 *
 * Sửa `ISendCodeBody` bên `@nook/shared` mà quên sửa ở đây thì **backend không
 * biên dịch được**. Đó là cách duy nhất biến một type — thứ tan biến lúc chạy —
 * thành một hợp đồng có răng.
 */
export class SendCodeDto implements ISendCodeBody {
  @ApiProperty({ enum: ['email', 'phone'], example: 'email' })
  @IsIn(['email', 'phone'])
  method!: TSignInMethod;

  @ApiProperty({ example: 'nam@gmail.com', description: 'Email hoặc số điện thoại' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(320)
  target!: string;
}

export class SendCodeResultDto implements ISendCodeResult {
  @ApiProperty({ example: LIMITS.codeResendSeconds, description: 'Chờ bấy nhiêu giây mới xin được mã nữa' })
  retryAfterSeconds!: number;

  @ApiProperty({ example: LIMITS.codeTtlSeconds })
  expiresInSeconds!: number;

  @ApiProperty({ example: LIMITS.codeLength })
  codeLength!: number;
}

/**
 * Danh sách ví dụ có tên — Swagger vẽ ra một Ô CHỌN ngay trên ô soạn JSON.
 *
 * Thân JSON thì Swagger UI **không** vẽ ô chọn cho từng trường, dù trường đó có
 * khai `enum`; nó chỉ vẽ một ô soạn JSON. Đây là thứ gần nhất, và thật ra tiện
 * hơn: chọn một cái là cả thân điền sẵn, không phải gõ tay từng khoá.
 */
export const SEND_CODE_EXAMPLES = {
  email: {
    summary: 'Bằng email  (đang mở)',
    value: { method: 'email', target: 'nam@gmail.com' },
  },
  phone: {
    summary: 'Bằng số điện thoại  (chưa mở — trả auth.method_unavailable)',
    value: { method: 'phone', target: '0901234567' },
  },
} as const;
