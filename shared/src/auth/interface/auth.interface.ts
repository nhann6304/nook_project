import type { TSignInMethod } from '../type/index.js';
import type { IUserProfile } from '../../user/interface/index.js';

// ── POST /v1/auth/code ──────────────────────────────────────────────────────

export interface ISendCodeBody {
  method: TSignInMethod;
  /** Email, hoặc số điện thoại. Server tự chuẩn hoá lại. */
  target: string;
}

export interface ISendCodeResult {
  /** Phải chờ bao nhiêu giây nữa mới xin được mã lần sau */
  retryAfterSeconds: number;
  /** Mã vừa gửi còn sống bao lâu */
  expiresInSeconds: number;
  /** Bao nhiêu ký tự — app dựng đúng chừng đó ô nhập */
  codeLength: number;
}

// ── POST /v1/auth/verify ────────────────────────────────────────────────────

export interface IVerifyCodeBody {
  method: TSignInMethod;
  target: string;
  code: string;
}

export interface IAuthTokens {
  /** Thẻ ngắn hạn, đính vào mỗi lần gọi */
  accessToken: string;
  /** Thẻ dài hạn, cất trong kho an toàn của máy, chỉ dùng để đổi thẻ mới */
  refreshToken: string;
  /** Thẻ ngắn hạn sống bao lâu, tính bằng giây */
  expiresInSeconds: number;
}

export interface IVerifyCodeResult extends IAuthTokens {
  /** Vừa mở tài khoản lần đầu — app đưa thẳng vào màn đặt tên */
  isNew: boolean;
  user: IUserProfile;
}

// ── POST /v1/auth/refresh · /logout ─────────────────────────────────────────

export interface IRefreshBody {
  refreshToken: string;
}

export interface ILogoutBody {
  refreshToken: string;
}

// ── Ruột của thẻ ────────────────────────────────────────────────────────────

/**
 * Thứ nằm trong thẻ sau khi mở ra. App KHÔNG cần biết cái này — để ở đây vì nó
 * là hợp đồng giữa bên phát thẻ và bên đọc thẻ, và sau này website cũng đọc.
 */
export interface ITokenClaims {
  /** id người dùng */
  sub: string;
  /** id phiên — thu hồi được từng phiên một, không phải cả tài khoản */
  sid: string;
  /** loại thẻ, để thẻ dài hạn không dùng thay thẻ ngắn hạn được */
  typ: 'access' | 'refresh';
  /**
   * id của CHÍNH cái thẻ này. Ngẫu nhiên, mỗi lần ký một khác.
   *
   * Không có nó thì ruột thẻ chỉ còn `{sub, sid, typ, iat, exp}` — mà `iat` và
   * `exp` tính bằng GIÂY. Ký hai lần trong cùng một giây là ra hai thẻ **giống
   * hệt nhau từng byte**, và khi đó việc xoay thẻ dài hạn không xảy ra: thẻ
   * "mới" chính là thẻ cũ, dấu vân trong bảng vẫn khớp, nên cả cái bẫy
   * "thẻ bị chép" cũng im luôn.
   *
   * Chuyện này xảy ra thật: app vừa đăng nhập xong đã gọi làm mới thẻ.
   */
  jti: string;
}
