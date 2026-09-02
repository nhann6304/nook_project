import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { API, MSG } from '@nook/shared';
import { ApiErrors, ApiResult, CurrentUser, Message } from '../../../core/decorator/index.js';
import type { IAuthUser } from '../../../core/interface/auth-user.interface.js';
import { MediaService } from './media.service.js';
import {
  CREATE_UPLOAD_EXAMPLES,
  CreateUploadDto,
  CreateUploadResultDto,
  MediaDto,
  ReadMediaQueryDto,
} from './media.dto.js';

/**
 * Ảnh — ba cửa, và bytes **không đi qua cửa nào cả**.
 *
 *   1. POST /v1/media/upload-url   xin giấy phép
 *   2. PUT  <đường đã ký>          app đẩy thẳng lên kho, không qua server
 *   3. POST /v1/media/:id/complete server soi lại rồi mới nhận
 *
 * Rồi `GET /v1/media/:id` đổi sang đường xem đã ký (302).
 */
@ApiTags('Ảnh')
@ApiBearerAuth('access-token')
@Controller()
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post(API.media.uploadUrl)
  @Message(MSG.OK)
  @ApiOperation({ summary: 'Xin đường tải ảnh lên' })
  @ApiBody({ type: CreateUploadDto, examples: CREATE_UPLOAD_EXAMPLES })
  @ApiResult(CreateUploadResultDto)
  @ApiErrors(400, 401)
  createUpload(
    @CurrentUser() me: IAuthUser,
    @Body() dto: CreateUploadDto,
  ): Promise<CreateUploadResultDto> {
    return this.media.createUpload(me.id, dto);
  }

  @Post(API.media.complete)
  @ApiOperation({ summary: 'Báo đã tải ảnh xong' })
  @ApiResult(MediaDto)
  @ApiErrors(401, 403, 404, 409)
  complete(
    @CurrentUser() me: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MediaDto> {
    return this.media.complete(me.id, id);
  }

  /**
   * Đổi sang đường xem đã ký. Trả **302**, không trả JSON.
   *
   * Vì sao không trả thẳng đường đã ký trong JSON: đường đó sống vài phút, mà
   * app thì lưu lại câu trả lời. Một đường dẫn hỏng sau năm phút nằm trong bộ
   * nhớ đệm của app là thứ rất khó lần ra.
   *
   * Đường `/v1/media/<id>` thì **ổn định** — dán vào thẻ ảnh, vào bộ nhớ đệm,
   * vào đâu cũng được; mỗi lần tải là một lần ký lại, và quyền xem được kiểm
   * đúng lúc đó chứ không phải lúc câu trả lời được tạo ra.
   */
  @Get(API.media.read)
  @ApiOperation({ summary: 'Xem ảnh (thêm ?variant=feed|thumb cho bản nhẹ)' })
  @ApiResponse({ status: 302, description: 'Chuyển sang đường đã ký của kho' })
  @ApiErrors(401, 403, 404, 409)
  async read(
    @CurrentUser() me: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() q: ReadMediaQueryDto,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const url = await this.media.readUrl(me.id, id, q.variant);
    // `no-store`: chính cái CHUYỂN HƯỚNG không được lưu, vì đích của nó hết
    // hạn. Tệp ảnh ở đầu kia thì trình duyệt và CDN cứ lưu thoải mái.
    await reply.header('cache-control', 'no-store').redirect(url, 302);
  }
}
