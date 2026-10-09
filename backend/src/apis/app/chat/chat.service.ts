import { HttpStatus, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import {
  CHAT_LIMITS,
  CHAT_SOCKET_OUT,
  ERR,
  MEDIA_STATUS,
  type IChatPresenceEvent,
  type ICursorPage,
  type TChatBackground,
} from '@nook/shared';
import { AppException } from '../../../core/error/app.exception.js';
import { Transactional } from '../../../core/transaction/transactional.decorator.js';
import type { CursorQueryDto } from '../../../core/dto/cursor.dto.js';
import { encodeCursor } from '../../../core/repository/index.js';
import type { ChatMember, ChatMessage, User } from '../../../database/entity/index.js';
import {
  ChatMemberRepository,
  ChatMessageRepository,
  ChatRepository,
  UserRepository,
} from '../../../repository/index.js';
import { RealtimeGateway } from '../../../realtime/index.js';
import { MediaService, isVideo } from '../media/index.js';
import { STICKER_CODE, STICKER_CODE_MAX } from './chat.constant.js';
import { ChatMapper } from './chat.mapper.js';
import type {
  ChatDto,
  ChatMessageDto,
  ChatMessagesQueryDto,
  ChatReadResultDto,
  SendChatMessageDto,
} from './chat.dto.js';

/**
 * Chat 1-1.
 *
 * ── Gửi một tin, và vì sao nhanh mà không trùng ─────────────────────────────
 *
 *   1. đã có tin (chat, người gửi, clientId)?  → trả lại tin đó, xong
 *   2. soi hình dạng tin, ảnh, tin được trả lời
 *   3. UPDATE chats SET last_seq+1 RETURNING   → số `seq`, KHOÁ dòng cuộc
 *   4. INSERT … ON CONFLICT (clientId) DO NOTHING
 *      đụng = một lần gửi lại chạy song song đã thắng ở bước 3 → trả lại số
 *      vừa lấy (còn giữ khoá nên không ai chen) và trả tin của nó
 *   5. COMMIT, RỒI mới bắn socket cho cả hai người (mọi máy)
 *
 * Bắn SAU khi commit: bắn trong giao dịch là có lúc app nhận tin mà hỏi lại
 * bằng REST thì không thấy (giao dịch còn chưa xong, hoặc đã cuộn lại).
 *
 * Socket và REST đi qua CÙNG `send()` — một luật, hai cửa.
 */
@Injectable()
export class ChatService {
  constructor(
    private readonly chats: ChatRepository,
    private readonly members: ChatMemberRepository,
    private readonly messages: ChatMessageRepository,
    private readonly users: UserRepository,
    private readonly media: MediaService,
    private readonly mapper: ChatMapper,
    private readonly realtime: RealtimeGateway,
  ) {}

  // ── Danh sách · mở cuộc ────────────────────────────────────────────────────

  async list(me: string, q: CursorQueryDto): Promise<ICursorPage<ChatDto>> {
    // Xin dư một dòng để biết còn nữa không.
    const rows = await this.chats.summariesFor(me, { cursor: q.cursor, limit: q.limit + 1 });
    const hasMore = rows.length > q.limit;
    const page = hasMore ? rows.slice(0, q.limit) : rows;
    const last = page.at(-1);
    return {
      items: await this.hydrate(page),
      nextCursor: hasMore && last ? encodeCursor(last.activeAt, last.id) : null,
    };
  }

  async get(me: string, chatId: string): Promise<ChatDto> {
    const rows = await this.chats.summariesFor(me, { chatId, limit: 1 });
    if (rows.length === 0) await this.mustMember(chatId, me);
    const [chat] = await this.hydrate(rows);
    return chat!;
  }

  /**
   * Mở (hoặc lấy lại) cuộc với một người.
   *
   * TODO(circle): chỉ cho chat với BẠN trong góc khi có module `circle`. Hiện
   * mở được với bất kỳ ai còn tài khoản.
   */
  async open(me: string, userId: string): Promise<ChatDto> {
    if (userId.toLowerCase() === me.toLowerCase()) {
      throw new AppException(ERR.BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }
    if (!(await this.users.findAlive(userId))) {
      throw new AppException(ERR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const chatId = await this.openPair(me, userId);
    return this.get(me, chatId);
  }

  @Transactional()
  async openPair(me: string, userId: string): Promise<string> {
    const chatId = await this.chats.openPair(me, userId);
    await this.members.addPair(chatId, me, userId);
    return chatId;
  }

  // ── Tin ────────────────────────────────────────────────────────────────────

  async history(me: string, chatId: string, q: ChatMessagesQueryDto): Promise<ICursorPage<ChatMessageDto>> {
    await this.mustMember(chatId, me);
    const limit = q.limit ?? CHAT_LIMITS.chatPageSize;
    const { items, hasMore } = await this.messages.page(chatId, { before: q.before, after: q.after, limit });

    // Con trỏ là một `seq`, truyền lại vào ĐÚNG tham số vừa dùng.
    const edge = q.after !== undefined ? items[0] : items.at(-1);
    return {
      items: this.mapper.toDtoList(items),
      nextCursor: hasMore && edge ? String(edge.seq) : null,
    };
  }

  /** Gửi tin — socket và REST cùng đi qua đây. */
  async send(me: string, chatId: string, dto: SendChatMessageDto): Promise<ChatMessageDto> {
    const { message, created } = await this.persist(me, chatId, dto);
    const out = this.mapper.toDto(message);

    // Tin cũ (gửi lại) thì không bắn lại: hai máy đã nhận từ lần đầu.
    if (created) {
      const members = await this.members.membersOf(chatId);
      this.realtime.toUsers(members.map((m) => m.userId), CHAT_SOCKET_OUT.message, out);
    }
    return out;
  }

  @Transactional()
  async persist(
    me: string,
    chatId: string,
    dto: SendChatMessageDto,
  ): Promise<{ message: ChatMessage; created: boolean }> {
    await this.mustMember(chatId, me);

    const again = await this.messages.findByClientId(chatId, me, dto.clientId);
    if (again) return { message: again, created: false };

    const content = await this.content(me, chatId, dto);

    const seq = await this.chats.nextSeq(chatId);
    if (seq === null) throw new AppException(ERR.CHAT_NOT_FOUND, HttpStatus.NOT_FOUND);

    const made = await this.messages.insertOnce({
      chatId,
      seq,
      senderId: me,
      clientId: dto.clientId,
      ...content,
    });
    if (made) return { message: made, created: true };

    // Thua một lần gửi lại chạy song song: trả số, trả tin của bên thắng.
    await this.chats.undoSeq(chatId);
    const winner = await this.messages.findByClientId(chatId, me, dto.clientId);
    if (!winner) throw new Error(`chat ${chatId}: clientId conflict but no row`);
    return { message: winner, created: false };
  }

  // ── Đã đọc · nền · đang gõ ─────────────────────────────────────────────────

  async read(me: string, chatId: string, seq: number): Promise<ChatReadResultDto> {
    const member = await this.mustMember(chatId, me);
    const moved = await this.members.advanceRead(chatId, me, seq);
    const result = { chatId, userId: me, seq: moved ?? member.lastReadSeq };

    // Báo cả hai: người kia để vẽ ✓✓, máy khác của mình để tắt chấm chưa đọc.
    if (moved !== null) {
      const members = await this.members.membersOf(chatId);
      this.realtime.toUsers(members.map((m) => m.userId), CHAT_SOCKET_OUT.read, result);
    }
    return result;
  }

  async setBackground(me: string, chatId: string, background: TChatBackground): Promise<ChatDto> {
    await this.mustMember(chatId, me);
    await this.members.setBackground(chatId, me, background);
    return this.get(me, chatId);
  }

  /** Người kia của cuộc này — cũng là câu kiểm "mình có trong cuộc không". */
  async peerOf(chatId: string, me: string): Promise<string> {
    const members = await this.members.membersOf(chatId);
    if (!members.some((m) => m.userId === me)) await this.mustMember(chatId, me);
    const peer = members.find((m) => m.userId !== me);
    if (!peer) throw new AppException(ERR.CHAT_NOT_FOUND, HttpStatus.NOT_FOUND);
    return peer.userId;
  }

  /** Không ghi gì cả: đang gõ chỉ là tín hiệu, mất cũng không sao. */
  typing(chatId: string, me: string, peerId: string): void {
    this.realtime.toUser(peerId, CHAT_SOCKET_OUT.typing, { chatId, userId: me });
  }

  /** Báo cho mọi người đang chat với `userId` rằng họ vừa vào / rời mạng. */
  async announcePresence(userId: string, online: boolean): Promise<void> {
    const peers = await this.chats.peerIdsOf(userId);
    const event: IChatPresenceEvent = { userId, online };
    this.realtime.toUsers(peers, CHAT_SOCKET_OUT.presence, event);
  }

  /** Ai trong số người đang chat với `userId` đang online — gửi riêng cho một socket vừa nối. */
  async onlinePeersOf(userId: string): Promise<string[]> {
    const peers = await this.chats.peerIdsOf(userId);
    return [...(await this.realtime.onlineAmong(peers))];
  }

  // ── Bên trong ──────────────────────────────────────────────────────────────

  /**
   * Hình dạng tin theo `kind`. Trả đúng các cột nội dung; CHECK trong DB chặn
   * lần nữa nếu chỗ này lọt.
   */
  private async content(
    me: string,
    chatId: string,
    dto: SendChatMessageDto,
  ): Promise<Pick<ChatMessage, 'kind' | 'body' | 'mediaId' | 'replyToId'>> {
    const body = dto.body ?? null;

    if (dto.replyToId) {
      const target = await this.messages.findOne({ id: dto.replyToId, chatId });
      if (!target) throw new AppException(ERR.BAD_REQUEST, HttpStatus.BAD_REQUEST, { field: 'replyToId' });
    }
    const base = { kind: dto.kind, replyToId: dto.replyToId ?? null };

    switch (dto.kind) {
      case 'text': {
        if (dto.mediaId || !body || body.trim().length === 0) {
          throw new AppException(ERR.CHAT_EMPTY_MESSAGE, HttpStatus.BAD_REQUEST);
        }
        return { ...base, body, mediaId: null };
      }
      case 'sticker': {
        if (dto.mediaId || !body || body.length > STICKER_CODE_MAX || !STICKER_CODE.test(body)) {
          throw new AppException(ERR.CHAT_BAD_STICKER, HttpStatus.BAD_REQUEST);
        }
        return { ...base, body, mediaId: null };
      }
      case 'image': {
        if (!dto.mediaId) throw new AppException(ERR.CHAT_EMPTY_MESSAGE, HttpStatus.BAD_REQUEST);
        // Ảnh phải CỦA người gửi và ĐÃ tải xong. Ảnh gốc, không ai bóp lại.
        const media = await this.media.mine(me, dto.mediaId);
        if (media.status !== MEDIA_STATUS.READY) {
          throw new AppException(ERR.MEDIA_NOT_UPLOADED, HttpStatus.CONFLICT);
        }
        if (isVideo(media.contentType)) {
          throw new AppException(ERR.MEDIA_TYPE_UNSUPPORTED, HttpStatus.BAD_REQUEST);
        }
        return { ...base, body: body && body.trim().length > 0 ? body : null, mediaId: media.id };
      }
    }
  }

  /** Có trong cuộc thì trả phía của mình; cuộc không có → 404, có mà không phải của mình → 403. */
  private async mustMember(chatId: string, me: string): Promise<ChatMember> {
    const member = await this.members.findMember(chatId, me);
    if (member) return member;
    if (await this.chats.exists({ id: chatId })) {
      throw new AppException(ERR.CHAT_NOT_MEMBER, HttpStatus.FORBIDDEN);
    }
    throw new AppException(ERR.CHAT_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  /** Dòng tóm tắt → `ChatDto`: hỏi người và tin cuối MỘT lần cho cả trang. */
  private async hydrate(rows: Awaited<ReturnType<ChatRepository['summariesFor']>>): Promise<ChatDto[]> {
    if (rows.length === 0) return [];
    const [people, lasts] = await Promise.all([
      this.users.find({ where: { id: In(rows.map((r) => r.peerId)) }, withDeleted: true }),
      this.messages.lastOf(rows.filter((r) => r.lastSeq > 0).map((r) => r.id)),
    ]);
    const byId = new Map<string, User>(people.map((u) => [u.id, u]));
    const lastByChat = new Map<string, ChatMessage>(lasts.map((m) => [m.chatId, m]));
    return rows.map((r) => this.mapper.toChat(r, byId.get(r.peerId), lastByChat.get(r.id)));
  }
}
