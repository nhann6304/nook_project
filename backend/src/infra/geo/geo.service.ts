import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { BlockList, isIP } from 'node:net';
import { Reader, type CountryResponse } from 'mmdb-lib';
import { Env } from '../../config/env/index.js';

/** Địa chỉ không nằm trên Internet công cộng — không có nước nào để tra. */
const PRIVATE = new BlockList();
for (const [net, bits] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
] as const) {
  PRIVATE.addSubnet(net, bits, 'ipv4');
}
for (const [net, bits] of [
  ['::1', 128],
  ['::', 128],
  ['fc00::', 7],
  ['fe80::', 10],
] as const) {
  PRIVATE.addSubnet(net, bits, 'ipv6');
}

/** `::ffff:1.2.3.4` (IPv4 đi qua socket IPv6) → `1.2.3.4`. */
function unmap(ip: string): string {
  return ip.startsWith('::ffff:') && isIP(ip.slice(7)) === 4 ? ip.slice(7) : ip;
}

export function isPublicIp(raw: string | null): boolean {
  if (!raw) return false;
  const ip = unmap(raw);
  const family = isIP(ip);
  if (family === 0) return false;
  return !PRIVATE.check(ip, family === 4 ? 'ipv4' : 'ipv6');
}

/**
 * IP → mã nước (ISO 3166-1 alpha-2). Ba nguồn, theo thứ tự:
 *
 *   1. IP nội bộ / loopback → `null`, dừng.
 *   2. `cf-ipcountry` của proxy biên — chỉ có khi `TRUST_PROXY` khai (xem
 *      `readClientDevice`).
 *   3. Tệp `.mmdb` ở `GEOIP_DB` (DB-IP Country Lite — CC BY 4.0, không cần
 *      khoá — hoặc MaxMind GeoLite2-Country). Đọc MỘT lần lúc bật, tra trong
 *      bộ nhớ.
 *
 * Không nguồn nào → `null`, và các dấu hiệu theo nước chỉ im, không đoán bừa.
 * Không đóng gói dữ liệu sẵn: gói có sẵn dữ liệu đều đi theo giấy phép
 * GeoLite2 hoặc tự tải lúc chạy — xem README mục 1.
 */
@Injectable()
export class GeoService implements OnModuleInit {
  private readonly log = new Logger('Geo');
  private reader: Reader<CountryResponse> | null = null;

  constructor(private readonly config: ConfigService<Env, true>) {}

  onModuleInit(): void {
    const path = this.config.get('GEOIP_DB', { infer: true });
    if (!path) return;
    try {
      this.reader = new Reader<CountryResponse>(readFileSync(path));
      const m = this.reader.metadata;
      this.log.log(
        `GeoIP database loaded: ${m.databaseType}, built ${m.buildEpoch.toISOString().slice(0, 10)}`,
      );
    } catch (e) {
      // Không chặn server: thiếu tệp thì chỉ mất dấu hiệu theo nước.
      this.log.warn(
        `GeoIP database not usable (${path}): ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  /** Mã nước, hoặc `null` khi không biết. */
  countryOf(ip: string | null, edgeCountry: string | null = null): string | null {
    if (!ip || !isPublicIp(ip)) return null;
    if (edgeCountry) return edgeCountry;
    if (!this.reader) return null;
    try {
      const hit = this.reader.get(unmap(ip));
      return hit?.country?.iso_code ?? hit?.registered_country?.iso_code ?? null;
    } catch {
      return null;
    }
  }
}
