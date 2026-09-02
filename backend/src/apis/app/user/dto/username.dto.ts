import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import {
  USERNAME_LIMITS,
  type IUsernameCheck,
  type TUsernameProblem,
} from '@nook/shared';

export class UsernameQueryDto {
  @ApiProperty({
    example: 'namnguyen',
    minLength: USERNAME_LIMITS.min,
    maxLength: USERNAME_LIMITS.max,
    description: 'Chữ thường, số, dấu chấm và gạch dưới. Chữ có dấu sẽ được bỏ dấu.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  // Nới hơn luật thật một chút: để `checkUsernameShape` trả về mã lỗi ĐÚNG
  // (`username.invalid` / `username.reserved`) thay vì `common.bad_request`
  // chung chung — app cần biết sai ở đâu để nói cho người dùng.
  @MinLength(1)
  @MaxLength(64)
  username!: string;
}

export class UsernameCheckDto implements IUsernameCheck {
  @ApiProperty({ example: 'namnguyen', description: 'Dạng chuẩn server dùng để so sánh' })
  key!: string;

  @ApiProperty({ example: true })
  available!: boolean;

  @ApiProperty({
    nullable: true,
    example: 'username.taken',
    description: 'Khoá tra chữ. `null` khi còn trống.',
  })
  problem!: TUsernameProblem;
}
