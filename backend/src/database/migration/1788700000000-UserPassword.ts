import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Mật khẩu — một cột trên `users`, không phải trên `user_identities`.
 *
 * Mật khẩu thuộc về TÀI KHOẢN, không thuộc về email hay số: đăng nhập bằng đích
 * nào thì cũng một mật khẩu. Để `NULL` được: tài khoản mở bằng mã từ trước chưa
 * có mật khẩu, và đường `/auth/verify` (đăng nhập bằng mã) vẫn chạy.
 *
 * Cột giữ chuỗi argon2 đầy đủ (`$argon2id$v=19$m=...`) — tham số băm nằm ngay
 * trong chuỗi, sau này tăng độ khó không cần thêm cột.
 */
export class UserPassword1788700000000 implements MigrationInterface {
  name = 'UserPassword1788700000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash"`);
  }
}
