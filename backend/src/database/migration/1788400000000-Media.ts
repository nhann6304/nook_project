import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bảng ảnh, và đổi cách trỏ ảnh đại diện.
 *
 * `users.avatar_key` (một chuỗi đường dẫn) đổi thành `users.avatar_media_id`
 * (trỏ vào bảng `media`). Lý do: một chuỗi đường dẫn không nói được ảnh đó đã
 * tải xong chưa, nặng bao nhiêu, ai tải lên. Bảng thì nói được.
 *
 * Chưa có ai dùng nên xoá thẳng cột cũ, không phải chuyển dữ liệu.
 *
 * KHÔNG có `ON DELETE CASCADE` từ `media` về `users`: xoá một người mà cuốn
 * theo ảnh gốc của họ là mất thứ không dựng lại được. Xoá tài khoản là chuyện
 * phải làm có chủ ý, từng bước, chứ không phải một hiệu ứng phụ.
 */
export class Media1788400000000 implements MigrationInterface {
  name = 'Media1788400000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE "media" (
        "id"           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id"     uuid        NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "kind"         varchar(16) NOT NULL,
        "status"       varchar(16) NOT NULL DEFAULT 'pending',
        "storage_key"  varchar(255) NOT NULL,
        "content_type" varchar(64) NOT NULL,
        "byte_size"    integer     NOT NULL,
        "width"        integer,
        "height"       integer,
        "ready_at"     timestamptz,
        "created_at"   timestamptz NOT NULL DEFAULT now(),
        "updated_at"   timestamptz NOT NULL DEFAULT now(),
        "created_by"   uuid,
        "updated_by"   uuid,
        CONSTRAINT "uq_media_storage_key" UNIQUE ("storage_key"),
        CONSTRAINT "ck_media_kind"   CHECK ("kind" IN ('avatar','moment')),
        CONSTRAINT "ck_media_status" CHECK ("status" IN ('pending','ready','failed')),
        CONSTRAINT "ck_media_size"   CHECK ("byte_size" > 0 AND "byte_size" <= 33554432)
      )
    `);
    await q.query(`CREATE INDEX "idx_media_owner" ON "media" ("owner_id")`);
    // Index một phần: dòng treo giữa chừng rất ít so với cả bảng, mà việc dọn
    // chúng thì chạy đều đặn. Quét cả bảng để tìm vài chục dòng là phí.
    await q.query(
      `CREATE INDEX "idx_media_pending" ON "media" ("created_at") WHERE "status" = 'pending'`,
    );

    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_key"`);
    await q.query(
      `ALTER TABLE "users" ADD COLUMN "avatar_media_id" uuid REFERENCES "media"("id") ON DELETE SET NULL`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_media_id"`);
    await q.query(`ALTER TABLE "users" ADD COLUMN "avatar_key" varchar(255)`);
    await q.query(`DROP TABLE IF EXISTS "media"`);
  }
}
