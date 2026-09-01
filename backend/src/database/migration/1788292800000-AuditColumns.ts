import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Sổ ghi việc: `created_by` · `updated_by` · `deleted_by`.
 *
 * Thêm cho ba bảng có người thật đứng sau mỗi dòng. **Không** thêm cho
 * `user_stats`, `user_achievements`, `achievements`: chúng do hệ thống tính ra
 * hoặc do danh mục sinh ra, `created_by` ở đó luôn rỗng và chỉ tổ chiếm chỗ.
 *
 * Cột để rỗng được, và rỗng là ĐÚNG lúc mở tài khoản — khi đó chưa có ai để ghi.
 *
 * KHÔNG đặt khoá ngoại về `users`: xoá một người mà làm hỏng cả sổ ghi việc họ
 * từng làm thì sổ đó không còn là sổ nữa.
 */
export class AuditColumns1788292800000 implements MigrationInterface {
  name = 'AuditColumns1788292800000';

  public async up(q: QueryRunner): Promise<void> {
    for (const table of ['users', 'user_identities', 'sessions']) {
      await q.query(`ALTER TABLE "${table}" ADD COLUMN "created_by" uuid`);
      await q.query(`ALTER TABLE "${table}" ADD COLUMN "updated_by" uuid`);
    }
    await q.query(`ALTER TABLE "users" ADD COLUMN "deleted_by" uuid`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "deleted_by"`);
    for (const table of ['users', 'user_identities', 'sessions']) {
      await q.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "updated_by"`);
      await q.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "created_by"`);
    }
  }
}
