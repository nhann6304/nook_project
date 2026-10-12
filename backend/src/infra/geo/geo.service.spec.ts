import { describe, expect, it } from 'vitest';
import { GeoService, isPublicIp } from './geo.service.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const any = (x: unknown) => x as any;

function build(table: Record<string, string> = {}) {
  const geo = new GeoService(any({ get: () => undefined }));
  // Đọc tệp .mmdb là việc của mmdb-lib; ở đây chỉ kiểm thứ tự các nguồn.
  any(geo).reader = {
    get: (ip: string) => (table[ip] ? { country: { iso_code: table[ip] } } : null),
  };
  return geo;
}

describe('GeoService', () => {
  it('IP nội bộ, loopback, rác -> không có nước', () => {
    for (const ip of [
      '127.0.0.1',
      '::1',
      '10.1.2.3',
      '192.168.1.5',
      '172.20.0.1',
      '::ffff:10.0.0.1',
      'fe80::1',
      'abc',
    ]) {
      expect(isPublicIp(ip)).toBe(false);
    }
    expect(isPublicIp('203.0.113.9')).toBe(true);
    expect(isPublicIp('::ffff:8.8.8.8')).toBe(true);
    expect(build({ '10.1.2.3': 'US' }).countryOf('10.1.2.3', 'US')).toBeNull();
  });

  it('proxy biên đi trước, rồi tới tệp tra', () => {
    const geo = build({ '8.8.8.8': 'US' });
    expect(geo.countryOf('8.8.8.8', 'VN')).toBe('VN');
    expect(geo.countryOf('8.8.8.8')).toBe('US');
    expect(geo.countryOf('::ffff:8.8.8.8')).toBe('US');
    expect(geo.countryOf('1.1.1.1')).toBeNull();
  });

  it('không cấu hình GEOIP_DB thì không ngã, chỉ không biết', () => {
    const geo = new GeoService(any({ get: () => undefined }));
    geo.onModuleInit();
    expect(geo.countryOf('8.8.8.8')).toBeNull();
  });
});
