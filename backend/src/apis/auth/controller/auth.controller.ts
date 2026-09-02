import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { API, MSG } from '@nook/shared';
import { Public, Message, ApiErrors, ApiNoData, ApiResult } from '../../../core/decorator/index.js';
import { AuthService } from '../service/index.js';
import {
  SEND_CODE_EXAMPLES,
  VERIFY_CODE_EXAMPLES,
  SendCodeDto,
  SendCodeResultDto,
  VerifyCodeDto,
  VerifyCodeResultDto,
  LogoutDto,
  RefreshDto,
  RefreshResultDto,
} from '../dto/index.js';

/**
 * Bốn cửa của việc đăng nhập.
 *
 * Cả bốn đều `@Public()` — người chưa đăng nhập thì làm gì có thẻ để qua cổng.
 * Kể cả `logout`: thẻ dài hạn nộp lên đã tự nói nó là phiên nào, và bắt phải có
 * thẻ ngắn hạn còn hạn mới cho đăng xuất là bắt người ta kẹt lại.
 *
 * Tay viết ở đây chỉ trả về DỮ LIỆU. Cái vỏ `{ ok, code, data, requestId }` do
 * `ResponseInterceptor` bọc, tự động — không cửa nào tự bọc, và cũng không cửa
 * nào quên bọc được.
 *
 * Mô tả Swagger cố tình NGẮN. Ai cần biết vì sao thì đọc mã, không đọc Swagger.
 */
@ApiTags('Đăng nhập')
@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post(API.auth.code)
  @HttpCode(HttpStatus.OK)
  @Message(MSG.CODE_SENT)
  @ApiOperation({ summary: 'Gửi mã đăng nhập' })
  @ApiBody({ type: SendCodeDto, examples: SEND_CODE_EXAMPLES })
  @ApiResult(SendCodeResultDto)
  @ApiErrors(400, 409, 429, 502)
  sendCode(@Body() dto: SendCodeDto, @Req() req: FastifyRequest): Promise<SendCodeResultDto> {
    return this.auth.sendCode(dto, req.ip ?? null);
  }

  @Public()
  @Post(API.auth.verify)
  @HttpCode(HttpStatus.OK)
  @Message(MSG.SIGNED_IN)
  @ApiOperation({ summary: 'Kiểm mã và phát thẻ' })
  @ApiBody({ type: VerifyCodeDto, examples: VERIFY_CODE_EXAMPLES })
  @ApiResult(VerifyCodeResultDto)
  @ApiErrors(400, 410, 429)
  verify(@Body() dto: VerifyCodeDto, @Req() req: FastifyRequest): Promise<VerifyCodeResultDto> {
    return this.auth.verifyCode(dto, req.ip ?? null);
  }

  @Public()
  @Post(API.auth.refresh)
  @HttpCode(HttpStatus.OK)
  @Message(MSG.TOKEN_REFRESHED)
  @ApiOperation({ summary: 'Làm mới thẻ' })
  @ApiResult(RefreshResultDto)
  @ApiErrors(400, 401)
  refresh(@Body() dto: RefreshDto): Promise<RefreshResultDto> {
    return this.auth.refresh(dto);
  }

  @Public()
  @Post(API.auth.logout)
  @HttpCode(HttpStatus.OK)
  @Message(MSG.SIGNED_OUT)
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiNoData()
  @ApiErrors(400, 401)
  logout(@Body() dto: LogoutDto): Promise<void> {
    return this.auth.logout(dto);
  }
}
