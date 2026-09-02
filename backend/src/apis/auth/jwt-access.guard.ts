import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { ERR } from '@nook/shared';
import { RequestContext } from '../../core/context/request.context.js';
import { AppException } from '../../core/error/app.exception.js';
import { IS_PUBLIC } from '../../core/decorator/public.decorator.js';
import { SessionService } from './service/session.service.js';
import type { IAuthUser } from '../../core/interface/auth-user.interface.js';

const BEARER = /^Bearer (.+)$/i;

/**
 * Cổng thẻ, gắn TOÀN CỤC (xem `APP_GUARD` trong `auth.module.ts`).
 *
 * Mặc định là ĐÓNG: đường mới viết ra là đã có cổng, tới khi ai đó cố tình dán
 * `@Public()` lên. Làm ngược lại — mở sẵn rồi nhớ mà đóng — thì cái quên đầu
 * tiên là một lỗ hổng, chứ không phải một lỗi 401 dễ thấy.
 *
 * ── Vì sao không dùng Passport ──────────────────────────────────────────────
 *
 * Bản trước dùng `passport` + `@nestjs/passport` + `passport-jwt`: ba gói cho
 * đúng ba việc — đọc chuỗi sau chữ `Bearer`, mở thẻ, tra phiên. Mở thẻ thì
 * `@nestjs/jwt` đã làm; tra phiên thì `SessionService` đã làm. Passport chỉ còn
 * đứng giữa hai thứ đó và làm mờ chúng đi.
 *
 * Bỏ đi còn được thêm một thứ: **nói đúng chuyện gì đã xảy ra.** Passport gộp
 * mọi kiểu hỏng vào một lần "không qua được", nên thẻ hết hạn và thẻ bịa ra
 * trả về cùng một mã. Ở đây tách được — và app hiện hai câu khác nhau:
 * "phiên hết hạn, đăng nhập lại" khác hẳn "có gì đó sai".
 */
@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<FastifyRequest & { user?: IAuthUser }>();

    const token = BEARER.exec(req.headers.authorization ?? '')?.[1];
    if (!token) throw new AppException(ERR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);

    // Ném ra mã đúng loại: hết hạn là một chuyện, thẻ hỏng là chuyện khác.
    const claims = this.sessions.verify(token, 'access');

    // Chữ ký đúng chưa đủ: phiên có thể đã bị thu hồi ở máy khác từ hôm qua.
    if (!(await this.sessions.isLive(claims.sid))) {
      throw new AppException(ERR.SESSION_REVOKED, HttpStatus.UNAUTHORIZED);
    }

    req.user = { id: claims.sub, sessionId: claims.sid };

    // Từ đây trở đi, mọi kho dữ liệu biết ai đang thao tác — `created_by` và
    // `updated_by` tự điền, không tầng nào phải chuyền tay id người gọi.
    RequestContext.setActor(claims.sub);

    return true;
  }
}
