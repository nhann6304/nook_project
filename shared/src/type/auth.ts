import type { UserProfile } from './user.js';
// Khai ở `constant/signin.ts` cùng chỗ với danh sách đường đang mở — hai thứ đó
// phải đi cùng nhau, tách ra là sớm muộn có chỗ lệch.
import type { SignInMethod } from '../constant/signin.js';

export type { SignInMethod };

// ── POST /v1/auth/code ──────────────────────────────────────────────────────

export interface SendCodeBody {
  method: SignInMethod;
  /** Email, hoặc số điện thoại. Server tự chuẩn hoá lại. */
  target: string;
}

export interface SendCodeResult {
  /** Phải chờ bao nhiêu giây nữa mới xin được mã lần sau */
  retryAfterSeconds: number;
  /** Mã vừa gửi còn sống bao lâu */
  expiresInSeconds: number;
  /** Bao nhiêu ký tự — app dựng đúng chừng đó ô nhập */
  codeLength: number;
}

// ── POST /v1/auth/verify ────────────────────────────────────────────────────

export interface VerifyCodeBody {
  method: SignInMethod;
  target: string;
  code: string;
}

export interface AuthTokens {
  /** Thẻ ngắn hạn, đính vào mỗi lần gọi */
  accessToken: string;
  /** Thẻ dài hạn, cất trong kho an toàn của máy, chỉ dùng để đổi thẻ mới */
  refreshToken: string;
  /** Thẻ ngắn hạn sống bao lâu, tính bằng giây */
  expiresInSeconds: number;
}

export interface VerifyCodeResult extends AuthTokens {
  /** Vừa mở tài khoản lần đầu — app đưa thẳng vào màn đặt tên */
  isNew: boolean;
  user: UserProfile;
}

// ── POST /v1/auth/refresh ───────────────────────────────────────────────────

export interface RefreshBody {
  refreshToken: string;
}

export type RefreshResult = AuthTokens;

// ── POST /v1/auth/logout ────────────────────────────────────────────────────

export interface LogoutBody {
  refreshToken: string;
}

// ── Ruột của thẻ ────────────────────────────────────────────────────────────

/**
 * Thứ nằm trong thẻ sau khi mở ra. App KHÔNG cần biết cái này — để ở đây vì
 * đây là hợp đồng giữa bên phát thẻ và bên đọc thẻ, và sau này website cũng đọc.
 */
export interface TokenClaims {
  /** id người dùng */
  sub: string;
  /** id phiên — thu hồi được từng phiên một, không phải thu cả tài khoản */
  sid: string;
  /** loại thẻ, để thẻ dài hạn không dùng thay thẻ ngắn hạn được */
  typ: 'access' | 'refresh';
}
