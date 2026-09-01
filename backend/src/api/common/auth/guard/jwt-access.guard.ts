import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ERR } from '@nook/shared';
import { AppException } from '../../error/index.js';
import { IS_PUBLIC } from '../../decorator/index.js';
import type { AuthUser } from '../type/index.js';

/**
 * Cổng thẻ, gắn TOÀN CỤC (xem `APP_GUARD` trong `auth.module.ts`).
 *
 * Mặc định là ĐÓNG: đường mới viết ra là đã có cổng, tới khi ai đó cố tình dán
 * `@Public()` lên. Làm ngược lại — mở sẵn rồi nhớ mà đóng — thì cái quên đầu
 * tiên là một lỗ hổng, chứ không phải một lỗi 401 dễ thấy.
 */
@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(ctx);
  }

  /**
   * Đổi lỗi của passport sang mã của mình. Không có chỗ này thì cửa 401 trả về
   * một hình dạng khác hẳn mọi lỗi còn lại, và app không tra bảng chữ được.
   */
  override handleRequest<T = AuthUser>(err: unknown, user: T | false): T {
    if (err instanceof AppException) throw err;
    if (err || !user) throw new AppException(ERR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    return user;
  }
}
