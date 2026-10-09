import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { TChatBackground } from '@nook/shared';
import { BaseRepository } from '../../core/repository/index.js';
import { ChatMember } from '../../database/entity/index.js';

@Injectable()
export class ChatMemberRepository extends BaseRepository<ChatMember> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, ChatMember);
  }

  /** Thêm hai phía của một cuộc. Chạy lại không đẻ thêm dòng. */
  async addPair(chatId: string, x: string, y: string): Promise<void> {
    await this.manager.query(
      `INSERT INTO "chat_members" ("chat_id", "user_id") VALUES ($1, $2), ($1, $3)
       ON CONFLICT DO NOTHING`,
      [chatId, x, y],
    );
  }

  findMember(chatId: string, userId: string): Promise<ChatMember | null> {
    return this.findOne({ chatId, userId });
  }

  membersOf(chatId: string): Promise<ChatMember[]> {
    return this.find({ where: { chatId } });
  }

  /**
   * Đọc tới `seq`. Chỉ TIẾN, không lùi (máy cũ báo muộn không kéo lùi được), và
   * không vượt `last_seq` của cuộc. Trả `null` nếu không tiến thêm được.
   */
  async advanceRead(chatId: string, userId: string, seq: number): Promise<number | null> {
    const [rows] = await this.manager.query<[{ last_read_seq: string }[], number]>(
      `UPDATE "chat_members" m
          SET "last_read_seq" = LEAST($3::bigint, c."last_seq"), "updated_at" = now()
         FROM "chats" c
        WHERE m."chat_id" = $1 AND m."user_id" = $2 AND c."id" = m."chat_id"
          AND LEAST($3::bigint, c."last_seq") > m."last_read_seq"
        RETURNING m."last_read_seq"`,
      [chatId, userId, seq],
    );
    return rows[0] ? Number(rows[0].last_read_seq) : null;
  }

  setBackground(chatId: string, userId: string, background: TChatBackground): Promise<number> {
    return this.update({ chatId, userId }, { background });
  }
}
