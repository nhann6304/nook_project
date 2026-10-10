import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Length, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  LIMITS,
  SIGNIN_METHODS,
  type ILoginBody,
  type IResetPasswordBody,
  type ISignupBody,
  type TSignInMethod,
} from '@nook/shared';
import { DeviceFieldsDto } from './verify-code.dto.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// Mật khẩu MỚI (signup, reset) chỉ `@IsString` ở đây, cố ý: độ dài do dịch vụ
// kiểm bằng `isPasswordLongEnough` để app nhận `auth.password_weak` — để DTO
// chặn thì app chỉ nhận `common.bad_request` chung chung. Không băm trước khi
// kiểm, nên chuỗi dài cũng không tốn CPU.
const NEW_PASSWORD = {
  example: 'mat-khau-cua-nam',
  minLength: LIMITS.passwordMin,
  maxLength: LIMITS.passwordMax,
  description: 'Dài ngoài khoảng này -> auth.password_weak',
} as const;

export class SignupDto extends DeviceFieldsDto implements ISignupBody {
  @ApiProperty({ enum: SIGNIN_METHODS, example: 'email' })
  @IsIn(SIGNIN_METHODS)
  method!: TSignInMethod;

  @ApiProperty({ example: 'nam@gmail.com' })
  @Transform(trim)
  @IsString()
  @MaxLength(320)
  target!: string;

  @ApiProperty({ example: '123456', minLength: LIMITS.codeLength, maxLength: LIMITS.codeLength })
  @IsString()
  @Length(LIMITS.codeLength, LIMITS.codeLength)
  @Matches(/^\d+$/)
  code!: string;

  @ApiProperty(NEW_PASSWORD)
  @IsString()
  password!: string;
}

export class ResetPasswordDto extends DeviceFieldsDto implements IResetPasswordBody {
  @ApiProperty({ enum: SIGNIN_METHODS, example: 'email' })
  @IsIn(SIGNIN_METHODS)
  method!: TSignInMethod;

  @ApiProperty({ example: 'nam@gmail.com' })
  @Transform(trim)
  @IsString()
  @MaxLength(320)
  target!: string;

  @ApiProperty({ example: '123456', minLength: LIMITS.codeLength, maxLength: LIMITS.codeLength })
  @IsString()
  @Length(LIMITS.codeLength, LIMITS.codeLength)
  @Matches(/^\d+$/)
  code!: string;

  @ApiProperty(NEW_PASSWORD)
  @IsString()
  password!: string;
}

export class LoginDto extends DeviceFieldsDto implements ILoginBody {
  @ApiProperty({ enum: SIGNIN_METHODS, example: 'email' })
  @IsIn(SIGNIN_METHODS)
  method!: TSignInMethod;

  @ApiProperty({ example: 'nam@gmail.com', description: 'Email hoặc số điện thoại' })
  @Transform(trim)
  @IsString()
  @MaxLength(320)
  target!: string;

  // Không cắt khoảng trắng: dấu cách đầu/cuối là một phần của mật khẩu.
  @ApiProperty({ example: 'mat-khau-cua-nam', maxLength: LIMITS.passwordMax })
  @IsString()
  @Length(1, LIMITS.passwordMax)
  password!: string;
}

export const SIGNUP_EXAMPLES = {
  email: {
    summary: 'Tạo tài khoản  (mã xin bằng intent "signup")',
    value: { method: 'email', target: 'nam@gmail.com', code: '123456', password: 'mat-khau-cua-nam' },
  },
  weak: {
    summary: 'Mật khẩu quá ngắn  (-> auth.password_weak)',
    value: { method: 'email', target: 'nam@gmail.com', code: '123456', password: 'ngan' },
  },
} as const;

export const LOGIN_EXAMPLES = {
  email: {
    summary: 'Bằng email',
    value: { method: 'email', target: 'nam@gmail.com', password: 'mat-khau-cua-nam' },
  },
  phone: {
    summary: 'Bằng số điện thoại',
    value: { method: 'phone', target: '0901234567', password: 'mat-khau-cua-nam' },
  },
} as const;

export const RESET_PASSWORD_EXAMPLES = {
  email: {
    summary: 'Đặt lại  (mã xin bằng intent "reset"; mọi máy khác bị đăng xuất)',
    value: { method: 'email', target: 'nam@gmail.com', code: '123456', password: 'mat-khau-moi-cua-nam' },
  },
} as const;
