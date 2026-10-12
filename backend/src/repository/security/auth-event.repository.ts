import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { TAuthEventKind } from '@nook/shared';
import { BaseRepository } from '../../core/repository/index.js';
import { AuthEvent } from '../../database/entity/index.js';

const FAILED: TAuthEventKind = 'login_failed';

/** Xoá theo mẻ: một câu DELETE trăm nghìn dòng giữ khoá và phình WAL một lúc. */
const PURGE_BATCH = 5_000;

@Injectable()
export class AuthEventRepository extends BaseRepository<AuthEvent> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, AuthEvent);
  }

  /** Lần vào được gần nhất (mọi loại trừ `login_failed`). */
  lastSuccessOf(userId: string): Promise<AuthEvent | null> {
    return this.repo
      .createQueryBuilder('e')
      .where('e.userId = :userId AND e.kind <> :failed', { userId, failed: FAILED })
      .orderBy('e.createdAt', 'DESC')
      .limit(1)
      .getOne();
  }

  /** Số lần sai mật khẩu từ `since` tới giờ. */
  failuresSince(userId: string, since: Date): Promise<number> {
    return this.repo
      .createQueryBuilder('e')
      .where('e.userId = :userId AND e.kind = :failed AND e.createdAt >= :since', {
        userId,
        failed: FAILED,
        since,
      })
      .getCount();
  }

  /** Các nước của những lần vào được (trong hạn giữ sổ). */
  async successCountriesOf(userId: string): Promise<string[]> {
    const rows: { c: string }[] = await this.manager.query(
      `SELECT DISTINCT "country" AS c FROM "auth_events"
        WHERE "user_id" = $1 AND "kind" <> $2 AND "country" IS NOT NULL`,
      [userId, FAILED],
    );
    return rows.map((r) => r.c);
  }

  /** Xoá dòng cũ hơn `cutoff`. Trả về số dòng đã xoá. */
  async purgeBefore(cutoff: Date): Promise<number> {
    let total = 0;
    for (;;) {
      const [, affected]: [unknown, number] = await this.manager.query(
        `DELETE FROM "auth_events" WHERE "id" IN (
           SELECT "id" FROM "auth_events" WHERE "created_at" < $1 LIMIT ${PURGE_BATCH}
         )`,
        [cutoff],
      );
      total += affected;
      if (affected < PURGE_BATCH) return total;
    }
  }
}
