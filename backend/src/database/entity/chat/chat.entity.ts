import { Column, Entity, Index, Unique } from 'typeorm';
import { AuditEntity, BIGINT_AS_NUMBER } from '../base/index.js';

/**
 * Một cuộc chat 1-1. Mỗi CẶP đúng một cuộc.
 *
 * Cặp lưu theo thứ tự chuẩn (`user_a_id < user_b_id`, có CHECK) — không thế
 * thì (A,B) và (B,A) là hai dòng, và hai người mở chat cùng lúc thành hai cuộc.
 *
 * `last_seq` là bộ đếm của cuộc: gửi tin = `UPDATE … SET last_seq = last_seq + 1
 * RETURNING`, câu đó khoá dòng nên hai tin cùng lúc không bao giờ trùng `seq`.
 */
@Entity('chats')
@Unique('uq_chat_pair', ['userAId', 'userBId'])
export class Chat extends AuditEntity {
  @Column({ name: 'user_a_id', type: 'uuid' })
  userAId!: string;

  @Index('idx_chat_user_b')
  @Column({ name: 'user_b_id', type: 'uuid' })
  userBId!: string;

  @Column({ name: 'last_seq', type: 'bigint', default: 0, transformer: BIGINT_AS_NUMBER })
  lastSeq!: number;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt!: Date | null;
}
