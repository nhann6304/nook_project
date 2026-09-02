import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Dấu vân của thẻ dài hạn ĐỜI TRƯỚC, và lúc xoay.
 *
 * Sinh ra để chịu được một chuyện xảy ra thật trên điện thoại: **hai lệnh gọi
 * cùng lúc cùng dính 401 và cùng đi làm mới thẻ.** Mạng chập chờn, người dùng
 * mở app rồi kéo làm mới ngay — chuyện thường ngày.
 *
 * Không có hai cột này thì lượt thứ hai cầm thẻ vừa bị xoay, và server chấm nó
 * là "thẻ bị chép" rồi thu hết phiên. Người dùng bị đá ra khỏi app vì mạng yếu.
 *
 * Có rồi thì: đúng một khoảng ngắn sau khi xoay, thẻ đời trước vẫn được nhận —
 * coi như một lần thử lại lành. Ngoài khoảng đó mới là chuyện đáng ngờ.
 */
export class SessionRotation1788500000000 implements MigrationInterface {
  name = 'SessionRotation1788500000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "sessions" ADD COLUMN "prev_refresh_hash" varchar(255)`);
    await q.query(`ALTER TABLE "sessions" ADD COLUMN "rotated_at" timestamptz`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "rotated_at"`);
    await q.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "prev_refresh_hash"`);
  }
}
