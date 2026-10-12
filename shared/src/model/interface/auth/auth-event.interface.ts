import type { IIdentified } from '../../../common/interface/record/record.interface.js';
import type { TAuthEventKind, TRiskFlag } from '../../type/index.js';

/**
 * Máy đã đăng nhập vào một tài khoản — nhìn từ web quản trị.
 * `GET /v1/admin/users/:id/devices`. Model/os do app tự khai, không đáng tin.
 */
export interface IUserDevice extends IIdentified {
  /** UUID app tự sinh một lần (header `x-device-id`) */
  deviceId: string;
  model: string | null;
  os: string | null;
  appVersion: string | null;
  /** Lần đầu chứng minh được hộp thư/số bằng mã trên máy này. `null` = chưa tin */
  trustedAt: string | null;
  firstIp: string | null;
  /** ISO 3166-1 alpha-2, `null` khi không tra được */
  firstCountry: string | null;
  lastIp: string | null;
  lastCountry: string | null;
  /** ISO 8601 */
  firstSeenAt: string;
  lastSeenAt: string;
}

/** Một dòng sổ đăng nhập. `GET /v1/admin/users/:id/auth-events`, mới nhất trước. */
export interface IAuthEvent extends IIdentified {
  kind: TAuthEventKind;
  /** `null` khi app không gửi `x-device-id` */
  deviceId: string | null;
  model: string | null;
  os: string | null;
  ip: string | null;
  country: string | null;
  risk: TRiskFlag[];
  /** ISO 8601 */
  createdAt: string;
}
