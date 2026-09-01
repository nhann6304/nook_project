import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Observable, tap } from 'rxjs';

/** Đường nào chậm hơn ngần này thì mới nói. Dưới ngưỡng là im. */
const SLOW_MS = 500;

/**
 * Chỉ kêu khi CHẬM.
 *
 * Log mọi request là log không ai đọc. Cái đáng biết là đường nào đang lê —
 * và nó nằm lẫn trong hàng nghìn dòng "200 OK 4ms" thì không ai thấy.
 */
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly log = new Logger('Chậm');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const started = Date.now();
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - started;
        if (ms >= SLOW_MS) {
          this.log.warn({ ms, path: req?.url }, `${req?.method ?? '?'} ${req?.url ?? '?'} — ${ms}ms`);
        }
      }),
    );
  }
}
