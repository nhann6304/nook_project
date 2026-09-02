import { Injectable, NestMiddleware } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { RequestContext } from '../context/index.js';

/**
 * Mở vùng `RequestContext` cho mỗi request.
 *
 * Là LỚP GIỮA chứ không phải bộ chặn (interceptor), và đó là chủ ý: lớp giữa
 * chạy TRƯỚC cổng thẻ, nên vùng đã mở sẵn khi cổng thẻ tìm ra người gọi và gọi
 * `setActor()`. Bộ chặn chạy SAU cổng thẻ — đặt ở đó thì lúc cổng thẻ cần ghi
 * tên người vào vùng, vùng còn chưa tồn tại.
 *
 * `userId` để trống lúc đầu và được điền sau bằng cách sửa thẳng vào đối tượng.
 * Không phải mẹo: một request bắt đầu khi chưa biết ai gọi, và biết ở giữa đường.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'] & { id?: string }, _res: unknown, next: () => void): void {
    RequestContext.run({ requestId: String(req.id ?? '-'), userId: null }, next);
  }
}
