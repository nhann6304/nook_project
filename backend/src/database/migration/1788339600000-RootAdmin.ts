import { MigrationInterface, QueryRunner } from 'typeorm';

/** Email mặc định khi không khai `ROOT_ADMIN_EMAIL`. */
const FALLBACK = 'root@nook.local';

/**
 * Tài khoản quản trị gốc: tạo sẵn, và **không xoá được**.
 *
 * ── Vì sao tạo ở migration ──────────────────────────────────────────────────
 *
 * Để cơ sở dữ liệu vừa dựng xong là đã có một `root`, không phải chờ ai bật
 * server hay gõ lệnh. Lấy email từ `ROOT_ADMIN_EMAIL` nếu có, không thì dùng
 * `root@nook.local` — địa chỉ không có thật, nên **không ai đăng nhập vào nó
 * được**, đúng như mong muốn: nó là chỗ giữ vai, không phải một lối vào.
 * Khai `ROOT_ADMIN_EMAIL` rồi bật server là `RootAdminService` phong vai cho
 * email thật của bạn.
 *
 * ── Vì sao chặn bằng trigger chứ không bằng mã ──────────────────────────────
 *
 * Chặn ở tầng mã thì chỉ chặn được đường đi qua mã. Còn `psql`, còn lệnh dọn
 * dữ liệu, còn một migration viết vội lúc nửa đêm. Trigger nằm ngay trong cơ
 * sở dữ liệu nên **mọi đường đều đi qua nó**, kể cả đường mình quên mất là có.
 *
 * Chặn: xoá thật, và xoá mềm (đặt `deleted_at`).
 * KHÔNG chặn: hạ vai. Đó là chủ ý — phải có đường bàn giao vai gốc cho người
 * khác. Lỡ hạ hết thì lần bật server sau `ROOT_ADMIN_EMAIL` dựng lại.
 */
export class RootAdmin1788339600000 implements MigrationInterface {
  name = 'RootAdmin1788339600000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE OR REPLACE FUNCTION nook_protect_root_admin() RETURNS trigger AS $fn$
      BEGIN
        IF TG_OP = 'DELETE' THEN
          IF OLD.role = 'root' THEN
            RAISE EXCEPTION 'root admin cannot be deleted (user %)', OLD.id;
          END IF;
          RETURN OLD;
        END IF;

        IF OLD.role = 'root' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
          RAISE EXCEPTION 'root admin cannot be soft-deleted (user %)', OLD.id;
        END IF;

        RETURN NEW;
      END;
      $fn$ LANGUAGE plpgsql
    `);

    await q.query(`
      CREATE TRIGGER trg_protect_root_admin
      BEFORE UPDATE OR DELETE ON "users"
      FOR EACH ROW EXECUTE FUNCTION nook_protect_root_admin()
    `);

    const email = (process.env.ROOT_ADMIN_EMAIL ?? FALLBACK).trim().toLowerCase();

    // Chèn người trước, rồi đích đăng nhập, rồi dòng đếm — đúng thứ tự khoá
    // ngoại. `ON CONFLICT DO NOTHING` để chạy lại migration trên kho đã có dữ
    // liệu cũng không nổ.
    const [user]: { id: string }[] = await q.query(
      `INSERT INTO "users" ("role", "display_name") VALUES ('root', 'Root') RETURNING "id"`,
    );
    if (!user) return;

    await q.query(
      `INSERT INTO "user_identities" ("user_id", "kind", "value", "verified_at")
       VALUES ($1, 'email', $2, now())
       ON CONFLICT ("kind", "value") DO NOTHING`,
      [user.id, email],
    );
    await q.query(`INSERT INTO "user_stats" ("user_id") VALUES ($1)`, [user.id]);
  }

  public async down(q: QueryRunner): Promise<void> {
    // Phải gỡ trigger TRƯỚC, không thì chính nó chặn lệnh xoá ngay dưới.
    await q.query(`DROP TRIGGER IF EXISTS trg_protect_root_admin ON "users"`);
    await q.query(`DROP FUNCTION IF EXISTS nook_protect_root_admin()`);
    await q.query(`DELETE FROM "users" WHERE "role" = 'root'`);
  }
}
