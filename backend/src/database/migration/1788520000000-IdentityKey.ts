import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Khoá duy nhất chuyển từ `value` sang `value_key`.
 *
 * ── Vì sao ────────────────────────────────────────────────────────────────
 *
 * `nam@gmail.com`, `nam+1@gmail.com`, `n.a.m@gmail.com` là ba `value` khác
 * nhau nhưng cùng rơi vào một hộp thư. Với khoá cũ, một hộp Gmail thật mở được
 * bao nhiêu tài khoản Nook tuỳ thích — mỗi cái đều nhận được mã 6 số, nên đều
 * "đã xác minh" hợp lệ. Đó là cách rẻ nhất để nuôi tài khoản hàng loạt.
 *
 * ── Hàm SQL dựng tạm rồi bỏ ───────────────────────────────────────────────
 *
 * Cùng luật với `identityKey()` bên `apis/app/user/`. Viết thành hàm rồi xoá
 * ngay sau khi lấp cột, chứ không để lại trong cơ sở dữ liệu: một luật nằm hai
 * chỗ thì sớm muộn hai chỗ lệch nhau, và cái nằm trong DB là cái không ai nhớ
 * đi sửa. Nhồi thẳng vào một câu `CASE` cũng được, nhưng đọc lại thì không.
 *
 * ── Nếu migration này ngã ─────────────────────────────────────────────────
 *
 * Nó ngã ở bước soi trùng, kèm số nhóm trùng. Đó là CHỦ Ý: hai tài khoản cùng
 * một hộp thư thì phải có người quyết giữ cái nào — gộp bừa là xoá dữ liệu của
 * một người thật. Gộp tay xong chạy lại.
 */
export class IdentityKey1788520000000 implements MigrationInterface {
  name = 'IdentityKey1788520000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "user_identities" ADD COLUMN "value_key" varchar(320)`);

    // `split_part(v,'@',1)` đủ đúng vì `looksLikeEmail` chỉ cho một dấu `@`.
    await q.query(`
      CREATE FUNCTION nook_identity_key(p_kind text, p_value text) RETURNS text AS $$
      DECLARE
        v text := lower(btrim(p_value));
        v_local text;
        v_domain text;
        v_base text;
      BEGIN
        IF p_kind <> 'email' THEN RETURN v; END IF;

        v_local := split_part(v, '@', 1);
        v_domain := split_part(v, '@', 2);
        IF v_domain = '' THEN RETURN v; END IF;

        v_base := COALESCE(NULLIF(split_part(v_local, '+', 1), ''), v_local);

        IF v_domain IN ('gmail.com', 'googlemail.com') THEN
          RETURN COALESCE(NULLIF(replace(v_base, '.', ''), ''), v_base) || '@gmail.com';
        END IF;

        RETURN v_base || '@' || v_domain;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE
    `);

    await q.query(`UPDATE "user_identities" SET "value_key" = nook_identity_key("kind", "value")`);
    await q.query(`DROP FUNCTION nook_identity_key(text, text)`);

    // Soi trùng TRƯỚC khi đặt ràng buộc, để câu báo lỗi nói được phải làm gì —
    // chứ không phải một dòng "duplicate key value violates unique constraint".
    await q.query(`
      DO $$
      DECLARE dup int;
      BEGIN
        SELECT count(*) INTO dup FROM (
          SELECT "kind", "value_key" FROM "user_identities"
          GROUP BY 1, 2 HAVING count(*) > 1
        ) t;

        IF dup > 0 THEN
          RAISE EXCEPTION
            'IdentityKey: % group(s) of accounts share one mailbox. Merge them by hand, then run this migration again.', dup;
        END IF;
      END $$
    `);

    await q.query(`ALTER TABLE "user_identities" ALTER COLUMN "value_key" SET NOT NULL`);
    await q.query(`ALTER TABLE "user_identities" DROP CONSTRAINT "uq_identity_kind_value"`);
    await q.query(
      `ALTER TABLE "user_identities"
       ADD CONSTRAINT "uq_identity_kind_value_key" UNIQUE ("kind", "value_key")`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    // Khoá trên `value_key` chặt hơn khoá trên `value`, nên dựng lại cái cũ
    // không bao giờ đụng trùng.
    await q.query(
      `ALTER TABLE "user_identities" DROP CONSTRAINT IF EXISTS "uq_identity_kind_value_key"`,
    );
    await q.query(
      `ALTER TABLE "user_identities"
       ADD CONSTRAINT "uq_identity_kind_value" UNIQUE ("kind", "value")`,
    );
    await q.query(`ALTER TABLE "user_identities" DROP COLUMN IF EXISTS "value_key"`);
  }
}
