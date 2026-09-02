import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { ERR, type TUserRole } from '@nook/shared';
import { AppException } from '../../../core/error/index.js';
import { REQUIRED_ROLES } from '../../../core/decorator/index.js';
import type { IAuthUser } from '../../../core/interface/index.js';
import { UserRepository } from '../../../repository/index.js';

/**
 * Cửa này có mở cho vai của người đang gọi không.
 *
 * Là lớp THỨ HAI, chạy sau cổng thẻ. Hai câu hỏi khác nhau và phải tách:
 *
 *   cổng thẻ    "anh có phải là ai đó không"     → 401
 *   cổng vai    "người đó có được vào đây không" → 403
 *
 * Gộp làm một thì app không phân biệt được "đăng nhập lại đi" với "tài khoản
 * này không có quyền", mà hai câu đó dẫn người dùng đi hai hướng ngược nhau.
 *
 * **Vai đọc từ BẢNG, không đọc từ thẻ.** Nhét vai vào thẻ thì nhanh hơn một câu
 * truy vấn, nhưng hạ một admin xong họ vẫn còn quyền tới khi thẻ hết hạn — mười
 * lăm phút, đúng mười lăm phút mà người ta muốn chặn ngay. Cửa quản trị thì ít
 * lượt gọi, một câu truy vấn thêm không đáng gì.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly users: UserRepository,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<TUserRole[] | undefined>(REQUIRED_ROLES, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    // Không dán `@Roles()` thì cửa mở cho mọi người đã đăng nhập.
    if (!required?.length) return true;

    const req = ctx.switchToHttp().getRequest<FastifyRequest & { user?: IAuthUser }>();
    if (!req.user) throw new AppException(ERR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);

    const user = await this.users.findAlive(req.user.id);
    if (!user || !required.includes(user.role)) {
      throw new AppException(ERR.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    return true;
  }
}
