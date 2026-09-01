import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ERR, type ApiError } from '@nook/shared';
import { AppException } from '../error/index.js';

/**
 * Một cửa ra duy nhất cho mọi thứ hỏng — nhánh `ok: false` của cái vỏ chung.
 *
 * Không có bộ lọc này thì server nói ba thứ tiếng khác nhau: lỗi của mình ra
 * một dạng, lỗi Nest ném ra dạng khác, lỗi không ai lường trước thì ra nguyên
 * vết ngăn xếp. App không thể tra bảng chữ với ba dạng.
 *
 * Chi tiết THẬT của lỗi 500 chỉ đi vào log, không đi ra ngoài — vết ngăn xếp
 * hay câu lỗi của Postgres là bản đồ cho người muốn phá.
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger('Error');

  catch(error: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const res = ctx.getResponse<FastifyReply>();
    const requestId = String(req?.id ?? '-');

    const body = this.shape(error, requestId);

    // Gắn mã lên chính request để dòng log của nó mang theo. Không có chỗ này
    // thì một request hỏng tốn HAI dòng — một dòng nói mã, một dòng nói đường —
    // và người đọc phải tự ghép chúng lại bằng mắt.
    if (req?.raw) (req.raw as { nookErrCode?: string }).nookErrCode = body.code;

    // Chỉ 500 mới đáng một dòng riêng: đó là thứ không ai lường trước, và vết
    // ngăn xếp chỉ có ở đây. Lỗi 4xx là chuyện thường ngày, đã nằm gọn trong
    // dòng của request rồi.
    if (body.status >= 500) {
      this.log.error(
        { requestId, path: req?.url, err: error },
        `${body.status} ${req?.method ?? '?'} ${req?.url ?? '?'} - ${body.code}`,
      );
    }

    void res.status(body.status).send(body);
  }

  private shape(error: unknown, requestId: string): ApiError {
    // Lỗi của mình — đã có sẵn mã.
    if (error instanceof AppException) {
      return {
        ok: false,
        code: error.code,
        status: error.getStatus(),
        requestId,
        ...(error.detail ? { detail: error.detail } : {}),
      };
    }

    // Lỗi Nest ném ra (404 không khớp đường, 401 từ guard, …). Đổi sang mã của mình.
    if (error instanceof HttpException) {
      const status = error.getStatus();
      return { ok: false, code: this.codeForStatus(status), status, requestId };
    }

    // Còn lại là thứ không ai lường trước. Ra ngoài chỉ đúng một câu.
    return {
      ok: false,
      code: ERR.SERVER_ERROR,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      requestId,
    };
  }

  private codeForStatus(status: number): string {
    if (status === HttpStatus.UNAUTHORIZED) return ERR.UNAUTHORIZED;
    if (status === HttpStatus.NOT_FOUND) return ERR.NOT_FOUND;
    if (status === HttpStatus.TOO_MANY_REQUESTS) return ERR.RATE_LIMITED;
    if (status === HttpStatus.NOT_IMPLEMENTED) return ERR.NOT_IMPLEMENTED;
    if (status < 500) return ERR.BAD_REQUEST;
    return ERR.SERVER_ERROR;
  }
}
