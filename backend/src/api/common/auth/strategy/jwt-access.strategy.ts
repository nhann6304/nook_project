import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ERR, type TokenClaims } from '@nook/shared';
import { Env } from '../../../../config/env/index.js';
import { AppException } from '../../error/index.js';
import { SessionService } from '../service/index.js';
import type { AuthUser } from '../type/index.js';

/**
 * Đọc thẻ ngắn hạn từ `Authorization: Bearer …`.
 *
 * Chỉ có MỘT chiến lược ở đây, cố ý. Thẻ dài hạn không đi qua passport — nó
 * được nộp thẳng vào thân của `/v1/auth/refresh` rồi `SessionService` tự mở.
 * Dựng thêm một chiến lược nữa cho một đường duy nhất là thêm một lớp để quên.
 */
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    config: ConfigService<Env, true>,
    private readonly sessions: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  async validate(claims: TokenClaims): Promise<AuthUser> {
    // Thẻ dài hạn KHÔNG được dùng thay thẻ ngắn hạn. Thiếu dòng này là ai cầm
    // thẻ 30 ngày cũng gọi được mọi đường, và việc thu hồi mất hết tác dụng.
    if (claims.typ !== 'access') {
      throw new AppException(ERR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    // Chữ ký đúng chưa đủ: phiên có thể đã bị thu hồi ở máy khác từ hôm qua.
    if (!(await this.sessions.isLive(claims.sid))) {
      throw new AppException(ERR.SESSION_REVOKED, HttpStatus.UNAUTHORIZED);
    }

    return { id: claims.sub, sessionId: claims.sid };
  }
}
