import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tên riêng — duy nhất trong cả hệ thống.
 *
 * ── Index DUY NHẤT MỘT PHẦN, không phải index duy nhất thường ───────────────
 *
 * `WHERE username_key IS NOT NULL`. Không có mệnh đề đó thì Postgres vẫn cho
 * nhiều `NULL` (chuẩn SQL coi hai `NULL` là khác nhau), nhưng index sẽ ôm cả
 * mấy trăm nghìn dòng chưa đặt tên — phình ra mà không tra cứu gì. Với một app
 * mà tên riêng là tuỳ chọn thì phần lớn dòng sẽ là `NULL`.
 *
 * ── Vì sao index là chỗ chặn THẬT ──────────────────────────────────────────
 *
 * Hai người cùng bấm chọn `nam` trong cùng một phần nghìn giây: cả hai cùng
 * hỏi "còn trống không", cả hai cùng nhận "còn". Chỉ ràng buộc của cơ sở dữ
 * liệu mới phân được ai thắng. Mọi lớp đệm phía trước — Redis, bộ nhớ, bộ lọc
 * Bloom — đều chỉ là GỢI Ý, không bao giờ là bảo đảm.
 */
export class Username1788480000000 implements MigrationInterface {
  name = 'Username1788480000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" ADD COLUMN "username" varchar(20)`);
    await q.query(`ALTER TABLE "users" ADD COLUMN "username_key" varchar(20)`);
    await q.query(
      `CREATE UNIQUE INDEX "uq_users_username_key" ON "users" ("username_key")
       WHERE "username_key" IS NOT NULL`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "uq_users_username_key"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "username_key"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "username"`);
  }
}
