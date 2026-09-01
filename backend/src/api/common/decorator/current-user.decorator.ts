import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthUser } from '../auth/auth.types.js';

/**
 * Lấy người đang gọi ra khỏi request.
 *
 *   @Get(API.user.me)
 *   me(@CurrentUser() user: AuthUser) { … }
 *
 * Chỉ có giá trị sau khi cổng thẻ đã chạy qua. Trên đường `@Public()` thì nó
 * là `undefined` — đừng dùng ở đó.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest & { user?: AuthUser }>();
    return req.user as AuthUser;
  },
);
