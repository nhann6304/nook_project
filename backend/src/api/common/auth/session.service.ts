import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { ERR, type AuthTokens, type TokenClaims } from '@nook/shared';
import { Env } from '../../../config/env.validation.js';
import { TransactionService } from '../../../database/transaction/transaction.service.js';
import { Transactional } from '../../../database/transaction/transactional.decorator.js';
import { AppException } from '../error/app.exception.js';
import { SessionRepository } from './session.repository.js';
import type { DeviceInfo } from './auth.types.js';

/**
 * Phát thẻ, xoay thẻ, thu thẻ.
 *
 * Một phiên = một máy. `id` của dòng `sessions` chính là `sid` trong thẻ, nên
 * thu hồi được từng máy một chứ không phải đá người ta ra khỏi mọi máy.
 *
 * Trong bảng chỉ có **dấu vân** argon2 của thẻ dài hạn. Đọc trộm được bảng cũng
 * không đăng nhập thay ai được.
 *
 * Thẻ dài hạn **xoay** mỗi lần làm mới. Dùng lại một thẻ đã xoay là dấu hiệu
 * thẻ đã bị chép đi — lúc đó không biết máy nào là của chủ, nên thu HẾT.
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly tx: TransactionService,
  ) {}

  /** Mở phiên mới cho một máy. Gọi sau khi mã đã đúng. */
  @Transactional()
  async open(userId: string, device: DeviceInfo): Promise<AuthTokens> {
    // Dựng dòng trước để có `id` — `id` đó chính là `sid` sẽ nằm trong thẻ.
    // Dấu vân điền ở bước hai; cả hai bước trong một giao dịch nên không ai
    // nhìn thấy khoảng giữa.
    const session = await this.sessions.create({
      userId,
      refreshHash: '',
      expiresAt: this.refreshExpiry(),
      deviceName: device.deviceName ?? null,
      platform: device.platform ?? null,
      appVersion: device.appVersion ?? null,
      ip: device.ip ?? null,
      lastUsedAt: new Date(),
    });

    const tokens = this.mint(userId, session.id);
    await this.sessions.update(
      { id: session.id },
      { refreshHash: await argon2.hash(tokens.refreshToken) },
    );

    return tokens;
  }

  /** Đổi thẻ dài hạn lấy cặp thẻ mới. Thẻ cũ chết ngay tại đây. */
  @Transactional()
  async rotate(refreshToken: string): Promise<AuthTokens> {
    const claims = this.verify(refreshToken, 'refresh');

    const session = await this.sessions.findById(claims.sid);
    if (!session || session.revokedAt !== null) {
      throw new AppException(ERR.SESSION_REVOKED, HttpStatus.UNAUTHORIZED);
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      throw new AppException(ERR.SESSION_EXPIRED, HttpStatus.UNAUTHORIZED);
    }

    // Thẻ ký đúng nhưng không khớp dấu vân = thẻ này đã bị xoay rồi mà vẫn có
    // người cầm. Nghĩa là nó đã bị chép đi. Không biết máy nào là của chủ, nên
    // thu hết rồi để họ đăng nhập lại — phiền một lần còn hơn mất tài khoản.
    if (!(await argon2.verify(session.refreshHash, refreshToken))) {
      // Giao dịch TÁCH RỜI, và đây là chỗ duy nhất trong dự án cần nó.
      //
      // Ngay dưới là một cú ném. Ném thì giao dịch đang chạy cuộn lại — cuộn
      // luôn cả việc thu hồi vừa ghi, và kẻ cầm thẻ chép được vẫn đi lại thoải
      // mái. Việc thu hồi phải Ở LẠI kể cả khi việc chính hỏng.
      //
      // Trên đường này chưa có câu ghi nào chạm vào `sessions`, nên giao dịch
      // tách rời không giành khoá với giao dịch ngoài. Thêm câu ghi nào phía
      // TRÊN chỗ này thì phải nghĩ lại.
      await this.tx.runIsolated(() => this.sessions.revokeAllOf(session.userId));
      throw new AppException(ERR.SESSION_REVOKED, HttpStatus.UNAUTHORIZED);
    }

    const tokens = this.mint(session.userId, session.id);
    await this.sessions.update(
      { id: session.id },
      {
        refreshHash: await argon2.hash(tokens.refreshToken),
        lastUsedAt: new Date(),
        expiresAt: this.refreshExpiry(),
      },
    );

    return tokens;
  }

  /** Đăng xuất một máy. */
  async close(refreshToken: string): Promise<void> {
    // `ignoreExpiration` ở đây là cố ý: người ta bấm Đăng xuất sau khi thẻ đã
    // hết hạn thì vẫn phải đăng xuất được. Từ chối là để họ kẹt lại ở một màn
    // hình không có đường ra.
    const claims = this.verify(refreshToken, 'refresh', { ignoreExpiration: true });
    await this.sessions.revoke(claims.sid);
  }

  /**
   * Phiên còn sống không. Cổng thẻ gọi hàm này ở MỖI request.
   *
   * Chặng sau nhét thêm một lớp đệm trong Redis: hỏi Postgres mỗi request chỉ
   * để biết "chưa bị thu hồi" là câu hỏi đắt cho một câu trả lời gần như luôn
   * luôn là "còn".
   */
  async isLive(sessionId: string): Promise<boolean> {
    const row = await this.sessions.findForGate(sessionId);
    if (!row) return false;
    if (row.revokedAt !== null) return false;
    return row.expiresAt.getTime() > Date.now();
  }

  /** Mở một thẻ ra xem có gì. Ném nếu chữ ký hỏng hoặc quá hạn. */
  verify(
    token: string,
    kind: TokenClaims['typ'],
    options?: { ignoreExpiration?: boolean },
  ): TokenClaims {
    let claims: TokenClaims;
    try {
      claims = this.jwt.verify<TokenClaims>(token, {
        secret: this.secretFor(kind),
        ignoreExpiration: options?.ignoreExpiration ?? false,
      });
    } catch {
      throw new AppException(ERR.SESSION_EXPIRED, HttpStatus.UNAUTHORIZED);
    }

    // Chốt quan trọng: thẻ dài hạn KHÔNG được dùng thay thẻ ngắn hạn. Không có
    // dòng này thì ai cầm thẻ 30 ngày cũng gọi được mọi đường, và việc thu hồi
    // mất tác dụng.
    if (claims.typ !== kind) {
      throw new AppException(ERR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    return claims;
  }

  // ── Bên trong ──────────────────────────────────────────────────────────────

  private mint(userId: string, sessionId: string): AuthTokens {
    const expiresInSeconds = this.config.get('JWT_ACCESS_TTL', { infer: true });
    const base = { sub: userId, sid: sessionId };

    return {
      accessToken: this.jwt.sign(
        { ...base, typ: 'access' } satisfies TokenClaims,
        { secret: this.secretFor('access'), expiresIn: expiresInSeconds },
      ),
      refreshToken: this.jwt.sign(
        { ...base, typ: 'refresh' } satisfies TokenClaims,
        {
          secret: this.secretFor('refresh'),
          expiresIn: this.config.get('JWT_REFRESH_TTL', { infer: true }),
        },
      ),
      expiresInSeconds,
    };
  }

  private secretFor(kind: TokenClaims['typ']): string {
    return kind === 'access'
      ? this.config.get('JWT_ACCESS_SECRET', { infer: true })
      : this.config.get('JWT_REFRESH_SECRET', { infer: true });
  }

  private refreshExpiry(): Date {
    return new Date(Date.now() + this.config.get('JWT_REFRESH_TTL', { infer: true }) * 1_000);
  }
}
