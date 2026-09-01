import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { map, type Observable } from 'rxjs';
import { MSG, type IApiEnvelope, type TMsgCode } from '@nook/shared';
import { MESSAGE_CODE } from '../decorator/index.js';

/**
 * Bọc mọi câu trả lời trót lọt vào MỘT cái vỏ.
 *
 *   { ok: true, code: 'auth.code_sent', data: {…}, requestId: 'req-9f2c' }
 *
 * Vì sao bọc: app chỉ phải viết ĐÚNG MỘT lớp đọc câu trả lời. Không bọc thì
 * mỗi cửa trả một kiểu và chỗ đọc phải đoán — lần này mảng, lần kia đối tượng,
 * lần nọ rỗng. Bọc ở đây, một lần, cho cả server: không cửa nào phải tự bọc, và
 * cũng không cửa nào quên bọc được.
 *
 * Nhánh hỏng KHÔNG đi qua đây — nó đi qua `AllExceptionFilter`. Hai chỗ, cùng
 * một hình dạng, phân biệt bằng `ok`.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<IApiEnvelope<unknown>> {
    const code =
      this.reflector.getAllAndOverride<TMsgCode>(MESSAGE_CODE, [ctx.getHandler(), ctx.getClass()]) ??
      MSG.OK;

    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const requestId = String(req?.id ?? '-');

    return next.handle().pipe(
      map((data: unknown) => ({
        ok: true as const,
        code,
        // `undefined` biến mất khi đổi sang JSON, `null` thì không. Cửa không
        // trả gì phải ra `data: null` chứ không phải thiếu hẳn trường `data`.
        data: data ?? null,
        requestId,
      })),
    );
  }
}
