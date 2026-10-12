import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../core/repository/index.js';
import { UserDevice } from '../../database/entity/index.js';

/** Một lần thấy máy, đủ để ghi lên dòng `user_devices`. */
export interface IDeviceSighting {
  userId: string;
  deviceId: string;
  model: string | null;
  os: string | null;
  appVersion: string | null;
  ip: string | null;
  country: string | null;
  /** Đã chứng minh hộp thư/số bằng mã trên máy này — đánh dấu tin cậy. */
  trust: boolean;
}

@Injectable()
export class UserDeviceRepository extends BaseRepository<UserDevice> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, UserDevice);
  }

  /** Mọi máy của một người, dùng gần nhất trước. Mỗi người chỉ vài máy. */
  listOf(userId: string, limit: number): Promise<UserDevice[]> {
    return this.find({ where: { userId }, order: { lastSeenAt: 'DESC', id: 'DESC' }, take: limit });
  }

  /**
   * Ghi một lần thấy máy: chưa có thì chèn, có rồi thì cập nhật lần cuối.
   * `ON CONFLICT` chứ không đọc-rồi-ghi: hai lần đăng nhập cùng lúc từ một máy
   * không được đẻ hai dòng. `trusted_at` chỉ đặt MỘT lần, không bao giờ gỡ.
   */
  async sighted(s: IDeviceSighting): Promise<void> {
    await this.manager.query(
      `INSERT INTO "user_devices"
         ("user_id", "device_id", "model", "os", "app_version", "trusted_at",
          "first_ip", "first_country", "last_ip", "last_country")
       VALUES ($1, $2, $3, $4, $5, CASE WHEN $6::boolean THEN now() END, $7, $8, $7, $8)
       ON CONFLICT ("user_id", "device_id") DO UPDATE SET
         "model"        = COALESCE(EXCLUDED."model", "user_devices"."model"),
         "os"           = COALESCE(EXCLUDED."os", "user_devices"."os"),
         "app_version"  = COALESCE(EXCLUDED."app_version", "user_devices"."app_version"),
         "trusted_at"   = COALESCE("user_devices"."trusted_at", EXCLUDED."trusted_at"),
         "last_ip"      = EXCLUDED."last_ip",
         "last_country" = EXCLUDED."last_country",
         "last_seen_at" = now()`,
      [s.userId, s.deviceId, s.model, s.os, s.appVersion, s.trust, s.ip, s.country],
    );
  }

  /** Các nước từng thấy trên máy của người này (lần đầu + lần cuối). */
  async countriesOf(userId: string): Promise<string[]> {
    const rows: { c: string }[] = await this.manager.query(
      `SELECT DISTINCT c FROM (
         SELECT "first_country" AS c FROM "user_devices" WHERE "user_id" = $1
         UNION ALL
         SELECT "last_country" FROM "user_devices" WHERE "user_id" = $1
       ) t WHERE c IS NOT NULL`,
      [userId],
    );
    return rows.map((r) => r.c);
  }
}
