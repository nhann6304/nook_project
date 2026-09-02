import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { map, type Observable } from 'rxjs';
import { MSG, type IApiEnvelope, type IApiMeta, type TMsgCode } from '@nook/shared';
import { MESSAGE_CODE } from '../decorator/index.js';

/** Hình dạng một trang lật bằng con trỏ, trước khi được dàn phẳng ra vỏ. */
interface CursorShape {
  items: unknown[];
  nextCursor: string | null;
}

/**
 * Cửa vừa trả về một trang danh sách phải không.
 *
 * Nhận đúng hai trường và không hơn — cố ý chặt tay. Nhận rộng là có ngày một
 * dữ liệu thật tình cờ có trường `items` bị bóc mất vỏ ngoài của chính nó.
 */
function isCursorPage(value: unknown): value is CursorShape {
  if (value === null || typeof value !== 'object') return false;
  const keys = Object.keys(value);
  if (keys.length !== 2 || !keys.includes('items') || !keys.includes('nextCursor')) return false;
  return Array.isArray((value as CursorShape).items);
}

/**
 * Bọc mọi câu trả lời trót lọt vào MỘT cái vỏ.
 *
 *   { ok: true, code: 'auth.code_sent', status: 200, data: {…}, metadata: {…} }
 *
 * Vì sao bọc: app chỉ phải viết ĐÚNG MỘT lớp đọc câu trả lời. Không bọc thì
 * mỗi cửa trả một kiểu và chỗ đọc phải đoán — lần này mảng, lần kia đối tượng,
 * lần nọ rỗng. Bọc ở đây, một lần, cho cả server: không cửa nào phải tự bọc, và
 * cũng không cửa nào quên bọc được.
 *
 * `metadata` gom mấy thứ nói VỀ câu trả lời, để `data` chỉ còn đúng thứ người
 * ta hỏi. Trang danh sách được DÀN PHẲNG ở đây: cửa cứ trả `{items, nextCursor}`
 * như cũ, còn ra tới app thì `data` chính là danh sách, con trỏ nằm ở
 * `metadata` — app không phải với qua `data.items`.
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

    const http = ctx.switchToHttp();
    const req = http.getRequest<FastifyRequest>();
    const res = http.getResponse<FastifyReply>();
    const requestId = String(req?.id ?? '-');

    return next.handle().pipe(
      map((payload: unknown) => {
        const metadata: IApiMeta = { requestId, serverTime: new Date().toISOString() };

        if (isCursorPage(payload)) {
          metadata.nextCursor = payload.nextCursor;
          metadata.hasMore = payload.nextCursor !== null;
          metadata.count = payload.items.length;
          return { ok: true as const, code, status: res.statusCode, data: payload.items, metadata };
        }

        return {
          ok: true as const,
          code,
          status: res.statusCode,
          // `undefined` biến mất khi đổi sang JSON, `null` thì không. Cửa không
          // trả gì phải ra `data: null` chứ không phải thiếu hẳn trường `data`.
          data: payload ?? null,
          metadata,
        };
      }),
    );
  }
}
