import { Column, CreateDateColumn, Entity, Unique } from 'typeorm';
import type { TChatMessageKind } from '@nook/shared';
import { BIGINT_AS_NUMBER, UuidEntity } from '../base/index.js';

/**
 * Một tin. **Chỉ ghi thêm** — không sửa, nên không có `updated_at`.
 *
 * Hai khoá duy nhất, hai việc khác nhau:
 *   (chat_id, seq)                  thứ tự trong cuộc; index này cũng là đường
 *                                   lật trang (B-tree quét ngược được)
 *   (chat_id, sender_id, client_id) gửi lại vì mạng chập = nhận lại tin cũ
 */
@Entity('chat_messages')
@Unique('uq_chat_message_seq', ['chatId', 'seq'])
@Unique('uq_chat_message_client', ['chatId', 'senderId', 'clientId'])
export class ChatMessage extends UuidEntity {
  @Column({ name: 'chat_id', type: 'uuid' })
  chatId!: string;

  @Column({ name: 'seq', type: 'bigint', transformer: BIGINT_AS_NUMBER })
  seq!: number;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId!: string;

  @Column({ name: 'kind', type: 'varchar', length: 16 })
  kind!: TChatMessageKind;

  /** Chữ (`text`), mã sticker (`sticker`), hoặc chú thích ảnh (`image`, có thể rỗng). */
  @Column({ name: 'body', type: 'text', nullable: true })
  body!: string | null;

  @Column({ name: 'media_id', type: 'uuid', nullable: true })
  mediaId!: string | null;

  @Column({ name: 'reply_to_id', type: 'uuid', nullable: true })
  replyToId!: string | null;

  @Column({ name: 'client_id', type: 'text' })
  clientId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
