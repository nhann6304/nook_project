import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../core/repository/index.js';
import { Chat, ChatMessage } from '../../database/entity/index.js';

@Injectable()
export class ChatMessageRepository extends BaseRepository<ChatMessage> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, ChatMessage);
  }

  findByClientId(chatId: string, senderId: string, clientId: string): Promise<ChatMessage | null> {
    return this.findOne({ chatId, senderId, clientId });
  }

  /**
   * Chèn, đụng (chat, người gửi, clientId) thì KHÔNG ném mà trả `null` — để
   * bên gọi trả lại tin cũ trong cùng giao dịch. Đụng khoá khác thì vẫn ném.
   */
  async insertOnce(row: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage | null> {
    const made = await this.manager.query<{ id: string; created_at: Date }[]>(
      `INSERT INTO "chat_messages"
         ("chat_id", "seq", "sender_id", "kind", "body", "media_id", "reply_to_id", "client_id")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT ("chat_id", "sender_id", "client_id") DO NOTHING
       RETURNING "id", "created_at"`,
      [row.chatId, row.seq, row.senderId, row.kind, row.body, row.mediaId, row.replyToId, row.clientId],
    );
    const hit = made[0];
    return hit ? this.repo.create({ ...row, id: hit.id, createdAt: new Date(hit.created_at) }) : null;
  }

  /**
   * Một trang lịch sử, LUÔN mới nhất trước.
   *
   *   before  lật về trước: seq < before
   *   after   hỏi bù sau khi nối lại: seq > after (lấy từ chỗ gần `after` nhất)
   *
   * Xin dư một dòng để biết còn nữa không.
   */
  async page(
    chatId: string,
    q: { before?: number | undefined; after?: number | undefined; limit: number },
  ): Promise<{ items: ChatMessage[]; hasMore: boolean }> {
    const qb = this.repo.createQueryBuilder('m').where('m.chatId = :chatId', { chatId });
    if (q.before !== undefined) qb.andWhere('m.seq < :before', { before: q.before });
    if (q.after !== undefined) qb.andWhere('m.seq > :after', { after: q.after });

    const rows = await qb
      .orderBy('m.seq', q.after !== undefined ? 'ASC' : 'DESC')
      .take(q.limit + 1)
      .getMany();

    const hasMore = rows.length > q.limit;
    const items = hasMore ? rows.slice(0, q.limit) : rows;
    if (q.after !== undefined) items.reverse();
    return { items, hasMore };
  }

  /** Tin cuối của nhiều cuộc, MỘT câu — nối theo (chat_id, last_seq). */
  lastOf(chatIds: string[]): Promise<ChatMessage[]> {
    if (chatIds.length === 0) return Promise.resolve([]);
    return this.repo
      .createQueryBuilder('m')
      .innerJoin(Chat, 'c', 'c.id = m.chatId AND c.lastSeq = m.seq')
      .where('m.chatId IN (:...chatIds)', { chatIds })
      .getMany();
  }

  /**
   * `viewerId` có được xem tấm ảnh này qua chat không: có tin trỏ tới nó, trong
   * một cuộc mà `viewerId` là thành viên. Luật quyền xem vẫn chỉ ở MỘT chỗ
   * (`MediaService.readUrl`); đây chỉ là câu hỏi, đặt ở kho để `media` (tầng 0)
   * không phải nhập `chat` (tầng 2).
   */
  isMediaVisibleTo(mediaId: string, viewerId: string): Promise<boolean> {
    return this.repo
      .createQueryBuilder('m')
      .innerJoin('chat_members', 'cm', 'cm.chat_id = m.chat_id AND cm.user_id = :viewerId', { viewerId })
      .where('m.mediaId = :mediaId', { mediaId })
      .getExists();
  }
}
