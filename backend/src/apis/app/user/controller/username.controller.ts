import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API } from '@nook/shared';
import { ApiErrors, ApiResult } from '../../../../core/decorator/index.js';
import { UsernameService } from '../service/index.js';
import { UsernameCheckDto, UsernameQueryDto } from '../dto/index.js';

/**
 * Hỏi một cái tên còn trống không.
 *
 * **App phải tự soi dạng trước khi gọi cửa này.** `checkUsernameShape` bên
 * `@nook/shared` chạy ngay trên máy, 0 mili giây, và bắt được phần lớn cái sai:
 * quá ngắn, có khoảng trắng, có emoji, trùng tên giữ chỗ. Chỉ tên đã đúng dạng
 * mới đáng đi một vòng mạng.
 *
 * Cộng thêm chờ ~300ms sau khi người ta ngừng gõ thì một cái tên mười chữ chỉ
 * tốn MỘT lần gọi, không phải mười.
 *
 * Phải đăng nhập mới gọi được — cửa này tra được cả kho tên, không có lý do gì
 * mở cho người lạ.
 */
@ApiTags('Người dùng')
@ApiBearerAuth('access-token')
@Controller()
export class UsernameController {
  constructor(private readonly usernames: UsernameService) {}

  @Get(API.user.usernameCheck)
  @ApiOperation({ summary: 'Tên riêng này còn trống không' })
  @ApiResult(UsernameCheckDto)
  @ApiErrors(400, 401)
  check(@Query() q: UsernameQueryDto): Promise<UsernameCheckDto> {
    return this.usernames.check(q.username);
  }
}
