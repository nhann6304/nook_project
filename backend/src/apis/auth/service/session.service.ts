import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { ERR, type IAuthTokens, type ITokenClaims } from '@nook/shared';
import { Env } from '../../../config/env/index.js';
import { Transactional } from '../../../core/transaction/index.js';
import { AppException } from '../../../core/error/index.js';
import { SessionRepository } from '../../../repository/session/index.js';
import { Session } from '../../../database/entity/index.js';
import type { IDeviceInfo } from '../interface/index.js';

/**
 * Sau khi xoay, thẻ ĐỜI TRƯỚC còn được nhận thêm ngần này.
 *
 * Không phải để nới lỏng bảo mật. Để chịu được một chuyện xảy ra thật trên
 * điện thoại: hai lệnh gọi cùng dính 401 rồi cùng đi làm mới, hoặc mạng chập
 * chờn nên app gửi lại đúng lệnh đó. Không có khoảng này thì người dùng bị đá
 * ra khỏi app vì sóng yếu — và họ sẽ không bao giờ biết vì sao.
 *
 * Ngắn thôi. Ngoài khoảng này mà còn cầm thẻ cũ thì đó là chuyện đáng ngờ thật.
 */
const ROTATION_GRACE_MS = 30_000;

/**
 * Thẻ đã xoay bị dùng lại ngoài khoảng ân hạn.
 *
 * Là lỗi RIÊNG chứ không phải `AppException`, vì nó phải mang theo `userId` ra
 * ngoài giao dịch — việc thu hồi toàn bộ phiên KHÔNG được chạy bên trong.
 * Xem `rotate()` để biết vì sao.
 */
class RefreshReuseDetected extends Error {
  constructor(readonly userId: string) {
    super('refresh token reuse detected');
  }
}

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
  private readonly log = new Logger('Session');

  constructor(
    private readonly sessions: SessionRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) { }

  /** Mở phiên mới cho một máy. Gọi sau khi mã đã đúng. */
  @Transactional()
  async open(userId: string, device: IDeviceInfo): Promise<IAuthTokens> {
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

  /**
   * Đổi thẻ dài hạn lấy cặp thẻ mới. Thẻ cũ chết ngay tại đây.
   *
   * ── Khoá dòng, không phải đọc thường ────────────────────────────────────
   *
   * `findForRotate` khoá dòng phiên (`SELECT … FOR UPDATE`). Không khoá thì
   * hai lượt làm mới cùng lúc cùng ĐỌC dấu vân cũ trước khi ai kịp GHI, nên cả
   * hai cùng thấy khớp và cả hai cùng xoay — bẫy "thẻ bị chép" không nổ trong
   * đúng cái ca nó sinh ra để bắt, và chỉ một trong hai thẻ mới là thẻ thật.
   * Đã đo và thấy đúng như vậy trước khi vá.
   */
  async rotate(refreshToken: string): Promise<IAuthTokens> {
    try {
      return await this.rotateLocked(refreshToken);
    } catch (error) {
      if (!(error instanceof RefreshReuseDetected)) throw error;

      // Thu hồi Ở NGOÀI giao dịch, sau khi nó đã cuộn lại và nhả khoá.
      //
      // Trước đây chỗ này gọi `tx.runIsolated()` ngay trong giao dịch, và nó
      // TREO THẬT: giao dịch ngoài đang giữ khoá dòng (`SELECT … FOR UPDATE`),
      // còn giao dịch tách rời thì `UPDATE sessions` — nó đợi khoá đó, mà khoá
      // đó chỉ nhả khi giao dịch ngoài xong, mà giao dịch ngoài thì đang đợi
      // nó. Postgres ghi rõ: `Lock/transactionid`.
      //
      // Ở đây thì giao dịch đã cuộn lại rồi — không giữ khoá nào nữa, và việc
      // thu hồi vẫn được ghi vì nó nằm ngoài phần bị cuộn.
      await this.sessions.revokeAllOf(error.userId);
      this.log.warn(`refresh token reuse: revoked all sessions of user ${error.userId}`);
      throw new AppException(ERR.SESSION_REVOKED, HttpStatus.UNAUTHORIZED);
    }
  }

  @Transactional()
  private async rotateLocked(refreshToken: string): Promise<IAuthTokens> {
    const claims = this.verify(refreshToken, 'refresh');

    const session = await this.sessions.findForRotate(claims.sid);
    if (!session || session.revokedAt !== null) {
      throw new AppException(ERR.SESSION_REVOKED, HttpStatus.UNAUTHORIZED);
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      throw new AppException(ERR.SESSION_EXPIRED, HttpStatus.UNAUTHORIZED);
    }

    if (!(await argon2.verify(session.refreshHash, refreshToken))) {
      // Chưa vội kết tội. Có thể đây chỉ là một lần thử lại lành: cùng một lệnh
      // làm mới bị gửi hai lần vì mạng chập chờn, hoặc hai lệnh gọi cùng dính
      // 401 rồi cùng đi làm mới. Thẻ ĐỜI TRƯỚC, trong khoảng ân hạn, thì nhận.
      const withinGrace =
        session.rotatedAt !== null &&
        Date.now() - session.rotatedAt.getTime() <= ROTATION_GRACE_MS;

      const isPrevious =
        withinGrace &&
        session.prevRefreshHash !== null &&
        (await argon2.verify(session.prevRefreshHash, refreshToken));

      if (isPrevious) {
        this.log.debug(`refresh retried within grace window: session ${session.id}`);
        return this.reissue(session);
      }

      // Ngoài khoảng ân hạn mà vẫn cầm thẻ đã xoay: thẻ này đã bị chép đi.
      // Ném ra NGOÀI để thu hồi — không thu ở đây, xem ghi chú ở `rotate()`.
      throw new RefreshReuseDetected(session.userId);
    }

    return this.reissue(session);
  }

  /** Ký cặp thẻ mới và ghi lại, giữ dấu vân đời trước để chịu được thử lại. */
  private async reissue(session: Session): Promise<IAuthTokens> {
    const tokens = this.mint(session.userId, session.id);
    await this.sessions.update(
      { id: session.id },
      {
        refreshHash: await argon2.hash(tokens.refreshToken),
        prevRefreshHash: session.refreshHash,
        rotatedAt: new Date(),
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
    kind: ITokenClaims['typ'],
    options?: { ignoreExpiration?: boolean },
  ): ITokenClaims {
    let claims: ITokenClaims;
    try {
      claims = this.jwt.verify<ITokenClaims>(token, {
        secret: this.secretFor(kind),
        ignoreExpiration: options?.ignoreExpiration ?? false,
      });
    } catch (error) {
      // Hai chuyện khác nhau, và app nói hai câu khác nhau: "phiên hết hạn,
      // đăng nhập lại" khác hẳn "thẻ này không đọc được". Gộp làm một là bắt
      // người dùng đoán.
      const expired = error instanceof Error && error.name === 'TokenExpiredError';
      throw new AppException(
        expired ? ERR.SESSION_EXPIRED : ERR.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
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

  /**
   * Ký một cặp thẻ mới.
   *
   * `jti` là bắt buộc, không phải trang trí. Thiếu nó thì ruột thẻ chỉ còn
   * `{sub, sid, typ, iat, exp}`, mà `iat`/`exp` tính bằng GIÂY — ký hai lần
   * trong cùng một giây ra hai thẻ giống hệt nhau từng byte. Khi đó việc xoay
   * thẻ dài hạn KHÔNG xảy ra: thẻ "mới" chính là thẻ cũ, dấu vân trong bảng
   * vẫn khớp, và cái bẫy "thẻ bị chép" cũng im luôn.
   *
   * App vừa đăng nhập xong đã gọi làm mới thẻ là chuyện bình thường, nên đây
   * không phải trường hợp hiếm.
   */
  private mint(userId: string, sessionId: string): IAuthTokens {
    const expiresInSeconds = this.config.get('JWT_ACCESS_TTL', { infer: true });
    const base = { sub: userId, sid: sessionId };

    return {
      accessToken: this.jwt.sign(
        { ...base, typ: 'access', jti: randomUUID() } satisfies ITokenClaims,
        { secret: this.secretFor('access'), expiresIn: expiresInSeconds },
      ),
      refreshToken: this.jwt.sign(
        { ...base, typ: 'refresh', jti: randomUUID() } satisfies ITokenClaims,
        {
          secret: this.secretFor('refresh'),
          expiresIn: this.config.get('JWT_REFRESH_TTL', { infer: true }),
        },
      ),
      expiresInSeconds,
    };
  }

  private secretFor(kind: ITokenClaims['typ']): string {
    return kind === 'access'
      ? this.config.get('JWT_ACCESS_SECRET', { infer: true })
      : this.config.get('JWT_REFRESH_SECRET', { infer: true });
  }

  private refreshExpiry(): Date {
    return new Date(Date.now() + this.config.get('JWT_REFRESH_TTL', { infer: true }) * 1_000);
  }
}
