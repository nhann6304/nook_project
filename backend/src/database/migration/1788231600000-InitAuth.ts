import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Chặng 1 — đăng nhập, hồ sơ, thành tích.
 *
 * ⚠️ Migration ở dự án này **viết tay bằng SQL**. Đừng chạy `migration:generate`.
 * Bộ sinh tự động không thấy được index một phần (`WHERE …`) và ràng buộc
 * `CHECK` — nó sẽ lặng lẽ đẻ ra một file xoá sạch chúng, và không ai nhận ra
 * cho tới lúc dữ liệu đã lệch.
 */
export class InitAuth1788231600000 implements MigrationInterface {
  name = 'InitAuth1788231600000';

  public async up(q: QueryRunner): Promise<void> {
    // ── Người dùng ───────────────────────────────────────────────────────────
    await q.query(`
      CREATE TABLE "users" (
        "id"                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "display_name"      varchar(24),
        "avatar_key"        varchar(255),
        "onboarded_at"      timestamptz,
        "tz_offset_minutes" smallint    NOT NULL DEFAULT 420,
        "locale"            varchar(8),
        "last_seen_at"      timestamptz,
        "deleted_at"        timestamptz,
        "created_at"        timestamptz NOT NULL DEFAULT now(),
        "updated_at"        timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "ck_users_display_name" CHECK ("display_name" IS NULL OR btrim("display_name") <> ''),
        CONSTRAINT "ck_users_tz"           CHECK ("tz_offset_minutes" BETWEEN -840 AND 840)
      )
    `);
    // Index một phần: chỉ đánh dấu dòng đã xoá — số này rất ít so với cả bảng.
    await q.query(
      `CREATE INDEX "idx_users_deleted_at" ON "users" ("deleted_at") WHERE "deleted_at" IS NOT NULL`,
    );

    // ── Đích đăng nhập ───────────────────────────────────────────────────────
    await q.query(`
      CREATE TABLE "user_identities" (
        "id"          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"     uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "kind"        varchar(8)  NOT NULL,
        "value"       varchar(320) NOT NULL,
        "verified_at" timestamptz,
        "created_at"  timestamptz NOT NULL DEFAULT now(),
        "updated_at"  timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "ck_identity_kind"       CHECK ("kind" IN ('email','phone')),
        CONSTRAINT "uq_identity_kind_value" UNIQUE ("kind","value")
      )
    `);
    await q.query(`CREATE INDEX "idx_identity_user" ON "user_identities" ("user_id")`);

    // ── Phiên ────────────────────────────────────────────────────────────────
    await q.query(`
      CREATE TABLE "sessions" (
        "id"           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"      uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "refresh_hash" varchar(255) NOT NULL,
        "device_name"  varchar(64),
        "platform"     varchar(16),
        "app_version"  varchar(24),
        "ip"           varchar(64),
        "expires_at"   timestamptz NOT NULL,
        "revoked_at"   timestamptz,
        "last_used_at" timestamptz,
        "created_at"   timestamptz NOT NULL DEFAULT now(),
        "updated_at"   timestamptz NOT NULL DEFAULT now()
      )
    `);
    await q.query(`CREATE INDEX "idx_session_user"    ON "sessions" ("user_id")`);
    await q.query(`CREATE INDEX "idx_session_expires" ON "sessions" ("expires_at")`);
    // Đường hay đi nhất: "phiên còn sống của người này". Index một phần cho nhẹ.
    await q.query(
      `CREATE INDEX "idx_session_live" ON "sessions" ("user_id") WHERE "revoked_at" IS NULL`,
    );

    // ── Danh mục thành tích ──────────────────────────────────────────────────
    await q.query(`
      CREATE TABLE "achievements" (
        "key"                varchar(64) PRIMARY KEY,
        "metric"             varchar(32) NOT NULL,
        "threshold"          integer     NOT NULL,
        "extra_circle_slots" integer     NOT NULL DEFAULT 0,
        "sort"               integer     NOT NULL DEFAULT 0,
        "active"             boolean     NOT NULL DEFAULT true,
        CONSTRAINT "ck_achievement_metric"    CHECK ("metric" IN ('friend_count','moment_count','memory_total','day_streak')),
        CONSTRAINT "ck_achievement_threshold" CHECK ("threshold" > 0),
        CONSTRAINT "ck_achievement_slots"     CHECK ("extra_circle_slots" >= 0)
      )
    `);

    // Danh mục đầu tiên. Tổng chỗ mở thêm được = 15, cộng với 10 chỗ ban đầu là
    // 25 — vẫn dưới trần 35, nên còn dư đất cho thành tích về sau.
    await q.query(`
      INSERT INTO "achievements" ("key","metric","threshold","extra_circle_slots","sort") VALUES
        ('circle.first_friend', 'friend_count',   1,  0, 10),
        ('circle.half_full',    'friend_count',   5,  0, 20),
        ('circle.full_house',   'friend_count',  10,  2, 30),
        ('moment.first',        'moment_count',   1,  0, 40),
        ('moment.hundred',      'moment_count', 100,  3, 50),
        ('memory.first_week',   'memory_total',   7,  2, 60),
        ('memory.hundred',      'memory_total', 100,  5, 70),
        ('streak.week',         'day_streak',     7,  1, 80),
        ('streak.month',        'day_streak',    30,  2, 90)
    `);

    // ── Thành tích của từng người ────────────────────────────────────────────
    await q.query(`
      CREATE TABLE "user_achievements" (
        "user_id"         uuid        NOT NULL REFERENCES "users"("id")        ON DELETE CASCADE,
        "achievement_key" varchar(64) NOT NULL REFERENCES "achievements"("key") ON DELETE RESTRICT,
        "unlocked_at"     timestamptz NOT NULL DEFAULT now(),
        "value_at_unlock" integer     NOT NULL,
        PRIMARY KEY ("user_id","achievement_key")
      )
    `);
    await q.query(
      `CREATE INDEX "idx_user_achievement_user" ON "user_achievements" ("user_id")`,
    );

    // ── Con đếm ──────────────────────────────────────────────────────────────
    await q.query(`
      CREATE TABLE "user_stats" (
        "user_id"            uuid        PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
        "friend_count"       integer     NOT NULL DEFAULT 0,
        "moment_count"       integer     NOT NULL DEFAULT 0,
        "memory_total"       integer     NOT NULL DEFAULT 0,
        "day_streak"         integer     NOT NULL DEFAULT 0,
        "streak_day_key"     varchar(10),
        "extra_circle_slots" integer     NOT NULL DEFAULT 0,
        "updated_at"         timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "ck_stats_nonneg" CHECK (
          "friend_count" >= 0 AND "moment_count" >= 0 AND "memory_total" >= 0
          AND "day_streak" >= 0 AND "extra_circle_slots" >= 0
        )
      )
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "user_stats"`);
    await q.query(`DROP TABLE IF EXISTS "user_achievements"`);
    await q.query(`DROP TABLE IF EXISTS "achievements"`);
    await q.query(`DROP TABLE IF EXISTS "sessions"`);
    await q.query(`DROP TABLE IF EXISTS "user_identities"`);
    await q.query(`DROP TABLE IF EXISTS "users"`);
  }
}
