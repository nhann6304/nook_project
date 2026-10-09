import { Column, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { TChatBackground } from '@nook/shared';
import { BIGINT_AS_NUMBER } from '../base/index.js';

/**
 * Phía của MỘT người trong một cuộc: đọc tới đâu, nền gì.
 *
 * Tách khỏi `chats` vì hai người đọc tới hai chỗ khác nhau và chọn hai nền
 * khác nhau. Cũng là bảng trả lời "ai được vào cuộc này" — kể cả quyền xem ảnh
 * gửi trong chat (`ChatMessageRepository.isMediaVisibleTo`).
 */
@Entity('chat_members')
export class ChatMember {
  @PrimaryColumn({ name: 'chat_id', type: 'uuid' })
  chatId!: string;

  @Index('idx_chat_member_user')
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'last_read_seq', type: 'bigint', default: 0, transformer: BIGINT_AS_NUMBER })
  lastReadSeq!: number;

  @Column({ name: 'background', type: 'text', default: 'default' })
  background!: TChatBackground;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
