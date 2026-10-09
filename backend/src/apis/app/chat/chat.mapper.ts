import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../../../core/mapper/base.mapper.js';
import type { ChatMessage, User } from '../../../database/entity/index.js';
import type { IChatSummaryRow } from '../../../repository/index.js';
import { ChatDto, ChatMessageDto, ChatPeerDto } from './chat.dto.js';

/**
 * Tin và cuộc chat → thứ đi ra ngoài.
 *
 * Người kia chỉ lộ đúng bốn trường của `IChatPeer` — không vai, không lần ghé
 * cuối, và KHÔNG cấp thân (luật sản phẩm: cấp thân chỉ hai người trong cặp thấy,
 * và nó không nằm trong chat).
 */
@Injectable()
export class ChatMapper extends BaseMapper<ChatMessage, ChatMessageDto> {
  toDto(m: ChatMessage): ChatMessageDto {
    return {
      id: m.id,
      chatId: m.chatId,
      seq: m.seq,
      senderId: m.senderId,
      kind: m.kind,
      body: m.body,
      mediaId: m.mediaId,
      replyToId: m.replyToId,
      clientId: m.clientId,
      createdAt: m.createdAt.toISOString(),
    };
  }

  /** `peer` thiếu (tài khoản đã xoá cứng) thì vẫn hiện cuộc, tên rỗng. */
  toPeer(peerId: string, user: User | undefined): ChatPeerDto {
    return {
      id: peerId,
      name: user?.displayName ?? user?.username ?? '',
      username: user?.username ?? null,
      avatarMediaId: user?.avatarMediaId ?? null,
    };
  }

  toChat(row: IChatSummaryRow, peer: User | undefined, last: ChatMessage | undefined): ChatDto {
    return {
      id: row.id,
      peer: this.toPeer(row.peerId, peer),
      lastMessage: last ? this.toDto(last) : null,
      unread: row.unread,
      peerReadSeq: row.peerReadSeq,
      background: row.background,
    };
  }
}
