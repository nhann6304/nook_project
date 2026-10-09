import { HttpStatus, Logger, type OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import type { Socket } from 'socket.io';
import {
  CHAT_SOCKET_IN,
  CHAT_SOCKET_OUT,
  ERR,
  type IChatPresenceEvent,
  type TChatSendAck,
  type TErrCode,
} from '@nook/shared';
import { AppException } from '../../../core/error/app.exception.js';
import { GATEWAY_OPTIONS, RealtimeGateway, type IPresenceChange } from '../../../realtime/index.js';
import { ChatService } from './chat.service.js';
import { TYPING_MIN_INTERVAL_MS } from './chat.constant.js';
import { ChatReadEventDto, ChatTypingEventDto, SendChatMessageEventDto } from './chat.dto.js';
import type { IChatSocketState } from './chat.interface.js';

/**
 * Chat qua ống — đường NHANH. REST (`ChatController`) là đường dự phòng, cùng
 * đi vào `ChatService`.
 *
 * Cùng không gian với `RealtimeGateway` (`GATEWAY_OPTIONS`): bên đó bắt tay và
 * đặt `client.data.userId`; cổng thẻ toàn cục chặn tin tới trước lúc đó.
 *
 * Mọi lỗi đều trả qua ack (`{ ok: false, code }`), không ném ra ngoài — ném
 * thì app chờ ack tới hết giờ mà không biết vì sao.
 */
@WebSocketGateway(GATEWAY_OPTIONS)
export class ChatGateway implements OnModuleInit {
  private readonly log = new Logger('ChatSocket');

  constructor(
    private readonly chats: ChatService,
    private readonly realtime: RealtimeGateway,
  ) {}

  onModuleInit(): void {
    this.realtime.onPresence((change) => this.presence(change));
  }

  @SubscribeMessage(CHAT_SOCKET_IN.send)
  async send(@ConnectedSocket() client: Socket, @MessageBody() body: unknown): Promise<TChatSendAck> {
    try {
      const dto = await this.parse(SendChatMessageEventDto, body);
      const { chatId, ...message } = dto;
      return { ok: true, data: await this.chats.send(this.me(client), chatId, message) };
    } catch (error) {
      return { ok: false, code: this.codeOf(error) };
    }
  }

  @SubscribeMessage(CHAT_SOCKET_IN.read)
  async read(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ): Promise<{ ok: true } | { ok: false; code: TErrCode }> {
    try {
      const dto = await this.parse(ChatReadEventDto, body);
      await this.chats.read(this.me(client), dto.chatId, dto.seq);
      return { ok: true };
    } catch (error) {
      return { ok: false, code: this.codeOf(error) };
    }
  }

  /** Không ack, không ghi gì: mất một lần "đang gõ" thì không ai thiệt. */
  @SubscribeMessage(CHAT_SOCKET_IN.typing)
  async typing(@ConnectedSocket() client: Socket, @MessageBody() body: unknown): Promise<void> {
    try {
      const { chatId } = await this.parse(ChatTypingEventDto, body);
      const state = this.state(client);
      const now = Date.now();
      if (now - (state.typedAt.get(chatId) ?? 0) < TYPING_MIN_INTERVAL_MS) return;
      state.typedAt.set(chatId, now);

      const me = this.me(client);
      let peer = state.peers.get(chatId);
      if (!peer) {
        peer = await this.chats.peerOf(chatId, me);
        state.peers.set(chatId, peer);
      }
      this.chats.typing(chatId, me, peer);
    } catch {
      // Cố ý im: đang gõ vào cuộc không phải của mình thì chỉ đơn giản là không ai nghe.
    }
  }

  /** Vào: báo người cùng chat (nếu là máy đầu tiên) + gửi riêng socket này ai đang online. */
  private async presence(change: IPresenceChange): Promise<void> {
    if (change.changed) await this.chats.announcePresence(change.userId, change.online);
    if (!change.online) return;

    for (const userId of await this.chats.onlinePeersOf(change.userId)) {
      const event: IChatPresenceEvent = { userId, online: true };
      change.socket.emit(CHAT_SOCKET_OUT.presence, event);
    }
  }

  // ── Bên trong ──────────────────────────────────────────────────────────────

  private me(client: Socket): string {
    const id = client.data?.userId as string | undefined;
    if (!id) throw new AppException(ERR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    return id;
  }

  private state(client: Socket): IChatSocketState {
    client.data.chat ??= { peers: new Map(), typedAt: new Map() } satisfies IChatSocketState;
    return client.data.chat as IChatSocketState;
  }

  /**
   * Kiểm thân tin bằng CÙNG lớp DTO với REST. `ValidationPipe` toàn cục chỉ
   * gắn vào HTTP nên ở đây phải gọi tay — cùng tuỳ chọn, cùng mã lỗi.
   */
  private async parse<T extends object>(type: ClassConstructor<T>, body: unknown): Promise<T> {
    if (body === null || typeof body !== 'object') {
      throw new AppException(ERR.BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }
    const dto = plainToInstance(type, body);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true, stopAtFirstError: true });
    if (errors.length > 0) {
      throw new AppException(ERR.BAD_REQUEST, HttpStatus.BAD_REQUEST, {
        fields: errors.map((e) => e.property).join(','),
      });
    }
    return dto;
  }

  private codeOf(error: unknown): TErrCode {
    if (error instanceof AppException) return error.code;
    this.log.error(
      `socket handler failed: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error.stack : undefined,
    );
    return ERR.SERVER_ERROR;
  }
}
