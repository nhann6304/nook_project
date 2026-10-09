import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import {
  CHAT_BACKGROUNDS,
  CHAT_LIMITS,
  CHAT_MESSAGE_KINDS,
  type IChat,
  type IChatBackgroundBody,
  type IChatMessage,
  type IChatMessagesQuery,
  type IChatPeer,
  type IChatReadBody,
  type IChatReadEvent,
  type IOpenChatBody,
  type ISendChatMessageBody,
  type ISendChatMessageEvent,
  type TChatBackground,
  type TChatMessageKind,
} from '@nook/shared';

/** Trần cứng của một trang lịch sử, chặn ai đó xin cả cuộc trong một lần. */
export const CHAT_PAGE_MAX = 100;

// ── Vào ──────────────────────────────────────────────────────────────────────

export class OpenChatDto implements IOpenChatBody {
  @ApiProperty({ format: 'uuid', description: 'Người muốn chat cùng' })
  @IsUUID()
  userId!: string;
}

/**
 * Gửi tin. Hình dạng theo `kind` (soi ở `ChatService`, CHECK trong DB chặn lần nữa):
 *   text     `body` bắt buộc
 *   sticker  `body` là mã sticker
 *   image    `mediaId` bắt buộc (ảnh GỐC đã tải xong), `body` là chú thích tuỳ chọn
 */
export class SendChatMessageDto implements ISendChatMessageBody {
  @ApiProperty({
    example: 'c-1728450000000-7f3a',
    maxLength: CHAT_LIMITS.chatClientIdMax,
    description: 'App tự sinh. Gửi lại cùng `clientId` thì nhận lại đúng tin cũ, không thành hai tin.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(CHAT_LIMITS.chatClientIdMax)
  clientId!: string;

  @ApiProperty({ enum: CHAT_MESSAGE_KINDS, example: 'text' })
  @IsIn(CHAT_MESSAGE_KINDS)
  kind!: TChatMessageKind;

  @ApiPropertyOptional({ example: 'Tối nay rảnh không?', maxLength: CHAT_LIMITS.chatTextMax })
  @IsOptional()
  @IsString()
  @MaxLength(CHAT_LIMITS.chatTextMax)
  body?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  mediaId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Trả lời tin nào (phải cùng cuộc)' })
  @IsOptional()
  @IsUUID()
  replyToId?: string;
}

/** Thân socket `chat.send`. */
export class SendChatMessageEventDto extends SendChatMessageDto implements ISendChatMessageEvent {
  @IsUUID()
  chatId!: string;
}

export class ChatReadDto implements IChatReadBody {
  @ApiProperty({ example: 42, description: 'Đã đọc tới `seq` này. Chỉ tiến, không lùi.' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  seq!: number;
}

/** Thân socket `chat.read`. */
export class ChatReadEventDto extends ChatReadDto {
  @IsUUID()
  chatId!: string;
}

/** Thân socket `chat.typing`. */
export class ChatTypingEventDto {
  @IsUUID()
  chatId!: string;
}

export class ChatBackgroundDto implements IChatBackgroundBody {
  @ApiProperty({ enum: CHAT_BACKGROUNDS, example: 'sunset' })
  @IsIn(CHAT_BACKGROUNDS)
  background!: TChatBackground;
}

const toInt = ({ value }: { value: unknown }) => (value === undefined || value === '' ? undefined : Number(value));

export class ChatMessagesQueryDto implements IChatMessagesQuery {
  @ApiPropertyOptional({ description: 'Lật về trước: lấy tin có seq < before. Truyền lại `metadata.nextCursor`.' })
  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1)
  before?: number;

  @ApiPropertyOptional({
    description: 'Hỏi bù sau khi nối lại: lấy tin có seq > after, từ chỗ gần `after` nhất. Truyền lại `metadata.nextCursor`.',
  })
  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(0)
  after?: number;

  @ApiPropertyOptional({ default: CHAT_LIMITS.chatPageSize, minimum: 1, maximum: CHAT_PAGE_MAX })
  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(1)
  @Max(CHAT_PAGE_MAX)
  limit?: number;
}

// ── Ra ───────────────────────────────────────────────────────────────────────

export class ChatMessageDto implements IChatMessage {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) chatId!: string;
  @ApiProperty({ example: 42, description: 'Tăng dần trong một cuộc' }) seq!: number;
  @ApiProperty({ format: 'uuid' }) senderId!: string;
  @ApiProperty({ enum: CHAT_MESSAGE_KINDS }) kind!: TChatMessageKind;
  @ApiProperty({ nullable: true, type: String }) body!: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    format: 'uuid',
    description: 'Ảnh GỐC: `GET /v1/media/<id>`. Bản nhẹ cho khung chat: `?variant=feed` / `thumb`.',
  })
  mediaId!: string | null;

  @ApiProperty({ nullable: true, type: String, format: 'uuid' }) replyToId!: string | null;
  @ApiProperty() clientId!: string;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
}

export class ChatPeerDto implements IChatPeer {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Nam' }) name!: string;
  @ApiProperty({ nullable: true, type: String, example: 'namnguyen' }) username!: string | null;
  @ApiProperty({ nullable: true, type: String, format: 'uuid' }) avatarMediaId!: string | null;
}

export class ChatDto implements IChat {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ type: ChatPeerDto }) peer!: ChatPeerDto;
  @ApiProperty({ type: ChatMessageDto, nullable: true }) lastMessage!: ChatMessageDto | null;
  @ApiProperty({ example: 3, description: 'Tin của người kia mình chưa đọc' }) unread!: number;
  @ApiProperty({ example: 40, description: '`seq` cuối người kia đã đọc — để vẽ ✓✓' }) peerReadSeq!: number;
  @ApiProperty({ enum: CHAT_BACKGROUNDS }) background!: TChatBackground;
}

export class ChatReadResultDto implements IChatReadEvent {
  @ApiProperty({ format: 'uuid' }) chatId!: string;
  @ApiProperty({ format: 'uuid' }) userId!: string;
  @ApiProperty({ example: 42, description: 'Mốc đọc SAU khi ghi (không lùi, không vượt tin cuối)' }) seq!: number;
}
