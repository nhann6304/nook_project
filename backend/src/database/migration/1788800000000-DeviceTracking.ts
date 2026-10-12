import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Máy đã đăng nhập (`user_devices`) và sổ đăng nhập (`auth_events`) — để nhận
 * ra đăng nhập lạ: máy mới, nước mới, đổi nước quá nhanh, sai dồn dập.
 *
 * `auth_events.user_id` NOT NULL: chỉ ghi cho tài khoản có thật (xem entity).
 * Index `(user_id, created_at DESC)` phục vụ cả ba câu hỏi nóng: lần đăng nhập
 * gần nhất, số lần sai trong một giờ, và lật trang ở web quản trị.
 */
export class DeviceTracking1788800000000 implements MigrationInterface {
  name = 'DeviceTracking1788800000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS "user_devices" (
        "id"            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"       uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "device_id"     uuid        NOT NULL,
        "model"         varchar(64),
        "os"            varchar(64),
        "app_version"   varchar(64),
        "trusted_at"    timestamptz,
        "first_ip"      varchar(64),
        "first_country" char(2),
        "last_ip"       varchar(64),
        "last_country"  char(2),
        "first_seen_at" timestamptz NOT NULL DEFAULT now(),
        "last_seen_at"  timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_user_device" UNIQUE ("user_id", "device_id"),
        CONSTRAINT "ck_user_device_first_country" CHECK ("first_country" ~ '^[A-Z]{2}$'),
        CONSTRAINT "ck_user_device_last_country"  CHECK ("last_country" ~ '^[A-Z]{2}$')
      )
    `);

    await q.query(`
      CREATE TABLE IF NOT EXISTS "auth_events" (
        "id"         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"    uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "kind"       varchar(16) NOT NULL,
        "device_id"  uuid,
        "model"      varchar(64),
        "os"         varchar(64),
        "ip"         varchar(64),
        "country"    char(2),
        "risk"       text[]      NOT NULL DEFAULT '{}',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "ck_auth_event_kind" CHECK (
          "kind" IN ('signup','login','login_failed','code_login','password_reset')
        ),
        CONSTRAINT "ck_auth_event_risk" CHECK (
          "risk" <@ ARRAY['new_device','new_country','impossible_travel','many_failures']::text[]
        ),
        CONSTRAINT "ck_auth_event_country" CHECK ("country" ~ '^[A-Z]{2}$')
      )
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS "idx_auth_event_user_time" ON "auth_events" ("user_id", "created_at" DESC)`,
    );
    // Việc dọn 180 ngày quét theo thời gian, không theo người.
    await q.query(
      `CREATE INDEX IF NOT EXISTS "idx_auth_event_time" ON "auth_events" ("created_at")`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "auth_events"`);
    await q.query(`DROP TABLE IF EXISTS "user_devices"`);
  }
}
