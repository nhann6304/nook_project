import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API, type ICursorPage } from '@nook/shared';
import { ApiCursorResult, ApiErrors, ApiResult, CurrentUser } from '../../../core/decorator/index.js';
import { CursorQueryDto } from '../../../core/dto/cursor.dto.js';
import type { IAuthUser } from '../../../core/interface/auth-user.interface.js';
import { ChatService } from './chat.service.js';
import {
  ChatBackgroundDto,
  ChatDto,
  ChatMessageDto,
  ChatMessagesQueryDto,
  ChatReadDto,
  ChatReadResultDto,
  OpenChatDto,
  SendChatMessageDto,
} from './chat.dto.js';

/**
 * Chat 1-1 qua REST. Đường NHANH là socket (`ChatGateway`); ở đây là danh sách,
 * lịch sử, và đường dự phòng khi ống đang đứt — cùng `ChatService`, cùng luật.
 */
@ApiTags('Chat')
@ApiBearerAuth('access-token')
@Controller()
export class ChatController {
  constructor(private readonly chats: ChatService) {}

  @Get(API.chat.list)
  @ApiOperation({ summary: 'Danh sách cuộc chat, mới nhất trước' })
  @ApiCursorResult(ChatDto)
  @ApiErrors(400, 401)
  list(@CurrentUser() me: IAuthUser, @Query() q: CursorQueryDto): Promise<ICursorPage<ChatDto>> {
    return this.chats.list(me.id, q);
  }

  @Post(API.chat.list)
  @ApiOperation({ summary: 'Mở (hoặc lấy lại) cuộc chat với một người' })
  @ApiBody({ type: OpenChatDto })
  @ApiResult(ChatDto)
  @ApiErrors(400, 401, 404)
  open(@CurrentUser() me: IAuthUser, @Body() dto: OpenChatDto): Promise<ChatDto> {
    return this.chats.open(me.id, dto.userId);
  }

  @Get(API.chat.messages)
  @ApiOperation({
    summary: 'Lịch sử tin, LUÔN mới nhất trước (before = lật về trước, after = hỏi bù sau khi nối lại)',
  })
  @ApiCursorResult(ChatMessageDto)
  @ApiErrors(400, 401, 403, 404)
  history(
    @CurrentUser() me: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() q: ChatMessagesQueryDto,
  ): Promise<ICursorPage<ChatMessageDto>> {
    return this.chats.history(me.id, id, q);
  }

  @Post(API.chat.messages)
  @ApiOperation({ summary: 'Gửi tin (dự phòng của socket chat.send) — gửi lại cùng clientId là an toàn' })
  @ApiBody({ type: SendChatMessageDto })
  @ApiResult(ChatMessageDto)
  @ApiErrors(400, 401, 403, 404, 409)
  send(
    @CurrentUser() me: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendChatMessageDto,
  ): Promise<ChatMessageDto> {
    return this.chats.send(me.id, id, dto);
  }

  @Post(API.chat.read)
  @ApiOperation({ summary: 'Đã đọc tới seq' })
  @ApiBody({ type: ChatReadDto })
  @ApiResult(ChatReadResultDto)
  @ApiErrors(400, 401, 403, 404)
  read(
    @CurrentUser() me: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChatReadDto,
  ): Promise<ChatReadResultDto> {
    return this.chats.read(me.id, id, dto.seq);
  }

  @Put(API.chat.background)
  @ApiOperation({ summary: 'Đổi nền khung chat (chỉ phía mình)' })
  @ApiBody({ type: ChatBackgroundDto })
  @ApiResult(ChatDto)
  @ApiErrors(400, 401, 403, 404)
  background(
    @CurrentUser() me: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChatBackgroundDto,
  ): Promise<ChatDto> {
    return this.chats.setBackground(me.id, id, dto.background);
  }
}
