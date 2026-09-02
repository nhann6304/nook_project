import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Vai của người dùng: `member` · `admin` · `root`.
 *
 * Mặc định `member`, nên mọi dòng đang có tự nhận vai đó — không phải chép dữ
 * liệu, không phải dừng server.
 *
 * Ràng buộc `CHECK` chứ không phải kiểu `enum` của Postgres: thêm một vai mới
 * vào `enum` phải `ALTER TYPE` và khoá bảng, còn `CHECK` thì chỉ cần bỏ rồi đặt
 * lại. Ba vai này chắc chắn còn đổi.
 *
 * Index một phần trên hai vai quản trị: bảng `users` rồi sẽ rất dài, mà số
 * admin thì đếm trên đầu ngón tay — trang quản trị hỏi "ai là admin" thì không
 * có lý do gì phải quét cả bảng.
 */
export class UserRole1788336000000 implements MigrationInterface {
  name = 'UserRole1788336000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" ADD COLUMN "role" varchar(16) NOT NULL DEFAULT 'member'`);
    await q.query(
      `ALTER TABLE "users" ADD CONSTRAINT "ck_users_role" CHECK ("role" IN ('member','admin','root'))`,
    );
    await q.query(
      `CREATE INDEX "idx_users_admin" ON "users" ("role") WHERE "role" IN ('admin','root')`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "idx_users_admin"`);
    await q.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "ck_users_role"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
  }
}
