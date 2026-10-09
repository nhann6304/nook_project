import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Chat 1-1: `chats` · `chat_members` · `chat_messages`, và mở `media.kind = 'chat'`.
 *
 * Khoá ngoại có đủ trong SQL, không có decorator quan hệ nào bên entity.
 *
 * Không có index riêng cho "lật trang theo (chat_id, seq DESC)": khoá duy nhất
 * `uq_chat_message_seq` đã là index B-tree trên đúng hai cột đó, và B-tree quét
 * ngược được. Thêm một cái nữa là ghi mỗi tin hai lần chỉ để có bản sao.
 *
 * `media_id` → `media` là RESTRICT: ảnh gốc không bao giờ bị xoá, và tin trỏ
 * vào ảnh không được thành tin trỏ vào hư không.
 */
export class Chat1788600000000 implements MigrationInterface {
  name = 'Chat1788600000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "ck_media_kind"`);
    await q.query(
      `ALTER TABLE "media" ADD CONSTRAINT "ck_media_kind" CHECK ("kind" IN ('avatar','moment','chat'))`,
    );

    await q.query(`
      CREATE TABLE IF NOT EXISTS "chats" (
        "id"              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_a_id"       uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "user_b_id"       uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "last_seq"        bigint      NOT NULL DEFAULT 0,
        "last_message_at" timestamptz,
        "created_at"      timestamptz NOT NULL DEFAULT now(),
        "updated_at"      timestamptz NOT NULL DEFAULT now(),
        "created_by"      uuid,
        "updated_by"      uuid,
        CONSTRAINT "uq_chat_pair"      UNIQUE ("user_a_id", "user_b_id"),
        CONSTRAINT "ck_chat_pair_order" CHECK ("user_a_id" < "user_b_id"),
        CONSTRAINT "ck_chat_last_seq"  CHECK ("last_seq" >= 0)
      )
    `);
    // `user_a_id` đã được `uq_chat_pair` phủ (cột đầu); `user_b_id` thì chưa.
    await q.query(`CREATE INDEX IF NOT EXISTS "idx_chat_user_b" ON "chats" ("user_b_id")`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS "chat_members" (
        "chat_id"       uuid        NOT NULL REFERENCES "chats"("id") ON DELETE CASCADE,
        "user_id"       uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "last_read_seq" bigint      NOT NULL DEFAULT 0,
        "background"    text        NOT NULL DEFAULT 'default',
        "updated_at"    timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY ("chat_id", "user_id"),
        CONSTRAINT "ck_chat_member_read" CHECK ("last_read_seq" >= 0),
        CONSTRAINT "ck_chat_member_background" CHECK (
          "background" IN ('default','sky','sunset','mint','lavender','peach','night','doodle')
        )
      )
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS "idx_chat_member_user" ON "chat_members" ("user_id")`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id"          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "chat_id"     uuid        NOT NULL REFERENCES "chats"("id") ON DELETE CASCADE,
        "seq"         bigint      NOT NULL,
        "sender_id"   uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "kind"        varchar(16) NOT NULL,
        "body"        text,
        "media_id"    uuid        REFERENCES "media"("id") ON DELETE RESTRICT,
        "reply_to_id" uuid        REFERENCES "chat_messages"("id") ON DELETE SET NULL,
        "client_id"   text        NOT NULL,
        "created_at"  timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_chat_message_seq"    UNIQUE ("chat_id", "seq"),
        CONSTRAINT "uq_chat_message_client" UNIQUE ("chat_id", "sender_id", "client_id"),
        CONSTRAINT "ck_chat_message_kind"   CHECK ("kind" IN ('text','sticker','image')),
        CONSTRAINT "ck_chat_message_client" CHECK (length("client_id") BETWEEN 1 AND 64),
        CONSTRAINT "ck_chat_message_body"   CHECK ("body" IS NULL OR length("body") <= 4000),
        CONSTRAINT "ck_chat_message_shape"  CHECK (
          ("kind" IN ('text','sticker') AND "body" IS NOT NULL AND "media_id" IS NULL)
          OR ("kind" = 'image' AND "media_id" IS NOT NULL)
        )
      )
    `);
    // Cho câu hỏi quyền xem ảnh (`MediaService.readUrl`). Một phần: đa số tin là chữ.
    await q.query(
      `CREATE INDEX IF NOT EXISTS "idx_chat_message_media" ON "chat_messages" ("media_id") WHERE "media_id" IS NOT NULL`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "chat_messages"`);
    await q.query(`DROP TABLE IF EXISTS "chat_members"`);
    await q.query(`DROP TABLE IF EXISTS "chats"`);
    // Ảnh `chat` đã có thì CHECK cũ không dựng lại được — `NOT VALID` để lùi
    // được mà không phải xoá ảnh gốc của ai.
    await q.query(`ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "ck_media_kind"`);
    await q.query(
      `ALTER TABLE "media" ADD CONSTRAINT "ck_media_kind" CHECK ("kind" IN ('avatar','moment')) NOT VALID`,
    );
  }
}
