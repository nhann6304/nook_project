import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { IAuthUser } from '../auth/interface/index.js';

/**
 * Lấy người đang gọi ra khỏi request.
 *
 *   @Get(API.user.me)
 *   me(@CurrentUser() user: IAuthUser) { … }
 *
 * Chỉ có giá trị sau khi cổng thẻ đã chạy qua. Trên đường `@Public()` thì nó
 * là `undefined` — đừng dùng ở đó.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IAuthUser => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest & { user?: IAuthUser }>();
    return req.user as IAuthUser;
  },
);
