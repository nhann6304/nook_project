import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bản nhẹ, và ghi lại ảnh nằm ở kho nào.
 *
 * `storage_provider` mặc định `minio` cho mấy dòng đang có — đúng, vì máy dev
 * đang dùng MinIO. Ngày lên thật thì ảnh mới ghi `r2`, ảnh cũ vẫn `minio`, và
 * server đọc đúng chỗ của từng tấm. Không có cột này thì lần đổi kho đầu tiên
 * là mất sạch ảnh cũ — mà bản gốc thì không dựng lại được.
 *
 * `ON DELETE CASCADE` từ bản nhẹ về bản gốc: đây là chỗ CASCADE đúng. Bản nhẹ
 * không còn nghĩa gì nếu bản gốc mất, và bản gốc thì đã chặn xoá ở chỗ khác.
 */
export class MediaVariant1788420000000 implements MigrationInterface {
  name = 'MediaVariant1788420000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "media" ADD COLUMN "storage_provider" varchar(16) NOT NULL DEFAULT 'minio'`,
    );

    await q.query(`
      CREATE TABLE "media_variants" (
        "id"               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "media_id"         uuid        NOT NULL REFERENCES "media"("id") ON DELETE CASCADE,
        "variant"          varchar(16) NOT NULL,
        "status"           varchar(16) NOT NULL DEFAULT 'pending',
        "storage_key"      varchar(255) NOT NULL,
        "storage_provider" varchar(16) NOT NULL,
        "content_type"     varchar(64) NOT NULL,
        "byte_size"        integer     NOT NULL,
        "width"            integer     NOT NULL,
        "height"           integer     NOT NULL,
        "created_at"       timestamptz NOT NULL DEFAULT now(),
        "updated_at"       timestamptz NOT NULL DEFAULT now(),
        "created_by"       uuid,
        "updated_by"       uuid,
        CONSTRAINT "uq_variant_media_kind" UNIQUE ("media_id", "variant"),
        CONSTRAINT "ck_variant_name"   CHECK ("variant" IN ('feed','thumb')),
        CONSTRAINT "ck_variant_status" CHECK ("status" IN ('pending','ready','failed'))
      )
    `);
    await q.query(`CREATE INDEX "idx_variant_media" ON "media_variants" ("media_id")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "media_variants"`);
    await q.query(`ALTER TABLE "media" DROP COLUMN IF EXISTS "storage_provider"`);
  }
}
