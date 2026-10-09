import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { TChatBackground } from '@nook/shared';
import { BaseRepository, decodeCursor } from '../../core/repository/index.js';
import { Chat } from '../../database/entity/index.js';
import type { IChatSummaryRow } from './chat.interface.js';

/** Cặp theo thứ tự chuẩn — khớp CHECK `user_a_id < user_b_id` (uuid chữ thường so như byte). */
export function chatPair(x: string, y: string): { userAId: string; userBId: string } {
  const [a, b] = [x.toLowerCase(), y.toLowerCase()];
  return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
}

@Injectable()
export class ChatRepository extends BaseRepository<Chat> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, Chat);
  }

  /** Mở cuộc cho một cặp, có rồi thì lấy lại. Hai người mở cùng lúc vẫn ra MỘT cuộc. */
  async openPair(x: string, y: string): Promise<string> {
    const { userAId, userBId } = chatPair(x, y);
    const made = await this.manager.query<{ id: string }[]>(
      `INSERT INTO "chats" ("user_a_id", "user_b_id", "created_by", "updated_by")
       VALUES ($1, $2, $3, $3)
       ON CONFLICT ("user_a_id", "user_b_id") DO NOTHING
       RETURNING "id"`,
      [userAId, userBId, x],
    );
    if (made[0]) return made[0].id;
    const found = await this.findOne({ userAId, userBId });
    return found!.id;
  }

  /**
   * Cấp `seq` tiếp theo. Câu UPDATE khoá dòng `chats` tới hết giao dịch, nên
   * hai tin cùng lúc xếp hàng ở đây chứ không bao giờ trùng số.
   */
  async nextSeq(chatId: string): Promise<number | null> {
    // `query` của UPDATE trả về [rows, affected] với driver pg.
    const [rows] = await this.manager.query<[{ last_seq: string }[], number]>(
      `UPDATE "chats" SET "last_seq" = "last_seq" + 1, "last_message_at" = now(), "updated_at" = now()
       WHERE "id" = $1 RETURNING "last_seq"`,
      [chatId],
    );
    return rows[0] ? Number(rows[0].last_seq) : null;
  }

  /**
   * Trả lại số vừa cấp. CHỈ gọi trong cùng giao dịch với `nextSeq` — lúc đó
   * mình còn giữ khoá dòng nên không ai kịp lấy số sau nó.
   */
  async undoSeq(chatId: string): Promise<void> {
    await this.manager.query(`UPDATE "chats" SET "last_seq" = "last_seq" - 1 WHERE "id" = $1`, [chatId]);
  }

  /**
   * Danh sách chat của một người, mới nhất trước, MỘT câu truy vấn.
   *
   * `unread` đếm trên index (chat_id, seq) và chỉ quét phần chưa đọc.
   * Con trỏ là (activeAt, id) — cùng kiểu với `pageByCursor`.
   */
  async summariesFor(
    userId: string,
    page: { cursor?: string | undefined; limit: number; chatId?: string },
  ): Promise<IChatSummaryRow[]> {
    const params: unknown[] = [userId];
    const where: string[] = [`me."user_id" = $1`];

    if (page.chatId) {
      params.push(page.chatId);
      where.push(`c."id" = $${params.length}`);
    }
    const mark = decodeCursor(page.cursor);
    if (mark) {
      params.push(mark.at, mark.id);
      where.push(
        `(COALESCE(c."last_message_at", c."created_at"), c."id") < ($${params.length - 1}, $${params.length})`,
      );
    }
    params.push(page.limit);

    const rows = await this.manager.query<
      {
        id: string;
        last_seq: string;
        active_at: Date;
        peer_id: string;
        peer_read: string;
        background: TChatBackground;
        unread: string;
      }[]
    >(
      `SELECT c."id", c."last_seq",
              COALESCE(c."last_message_at", c."created_at") AS "active_at",
              peer."user_id" AS "peer_id", peer."last_read_seq" AS "peer_read",
              me."background",
              (SELECT count(*) FROM "chat_messages" m
                WHERE m."chat_id" = c."id" AND m."seq" > me."last_read_seq"
                  AND m."sender_id" <> me."user_id") AS "unread"
         FROM "chat_members" me
         JOIN "chats" c ON c."id" = me."chat_id"
         JOIN "chat_members" peer ON peer."chat_id" = c."id" AND peer."user_id" <> me."user_id"
        WHERE ${where.join(' AND ')}
        ORDER BY "active_at" DESC, c."id" DESC
        LIMIT $${params.length}`,
      params,
    );

    return rows.map((r) => ({
      id: r.id,
      lastSeq: Number(r.last_seq),
      activeAt: new Date(r.active_at),
      peerId: r.peer_id,
      peerReadSeq: Number(r.peer_read),
      background: r.background,
      unread: Number(r.unread),
    }));
  }

  /** Mọi người đang có cuộc chat với `userId` — để báo vào/rời mạng. */
  async peerIdsOf(userId: string): Promise<string[]> {
    const rows = await this.manager.query<{ peer_id: string }[]>(
      `SELECT CASE WHEN "user_a_id" = $1 THEN "user_b_id" ELSE "user_a_id" END AS "peer_id"
         FROM "chats" WHERE "user_a_id" = $1 OR "user_b_id" = $1`,
      [userId],
    );
    return rows.map((r) => r.peer_id);
  }

  /** Hai người này có chung một cuộc chat không. */
  sharesChat(x: string, y: string): Promise<boolean> {
    return this.exists(chatPair(x, y));
  }
}
