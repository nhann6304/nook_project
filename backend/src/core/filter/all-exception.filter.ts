import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ERR, type IApiError, type IApiMeta } from '@nook/shared';
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
      // Chữ ký của Nest là `(message, stack)`. Gọi kiểu pino — `({obj}, msg)` —
      // thì đối tượng bị in thành câu chữ và câu chữ bị coi là vết ngăn xếp,
      // nên vết ngăn xếp THẬT biến mất. Đúng thứ mình cần nhất lúc có lỗi 500.
      this.log.error(
        `${body.status} ${req?.method ?? '?'} ${req?.url ?? '?'} - ${body.code} [${requestId}]`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    void res.status(body.status).send(body);
  }

  private shape(error: unknown, requestId: string): IApiError {
    // `data: null` chứ không phải thiếu trường — hai nhánh phải cùng một bộ
    // trường thì app mới đọc được bằng một lớp duy nhất.
    //
    // Dựng theo đúng THỨ TỰ của nhánh trót lọt (ok · code · status · data ·
    // metadata). Trải một khối dùng chung vào đầu thì gọn hơn, nhưng nó đẩy
    // `data` lên trước `code` và hai nhánh đọc ra hai kiểu khác nhau trong log.
    const tail = { data: null, metadata: this.meta(requestId) };

    // Lỗi của mình — đã có sẵn mã.
    if (error instanceof AppException) {
      return {
        ok: false,
        code: error.code,
        status: error.getStatus(),
        ...tail,
        ...(error.detail ? { detail: error.detail } : {}),
      };
    }

    // Lỗi Nest ném ra (404 không khớp đường, 401 từ guard, …). Đổi sang mã của mình.
    if (error instanceof HttpException) {
      const status = error.getStatus();
      return { ok: false, code: this.codeForStatus(status), status, ...tail };
    }

    // Còn lại là thứ không ai lường trước. Ra ngoài chỉ đúng một câu.
    return {
      ok: false,
      code: ERR.SERVER_ERROR,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      ...tail,
    };
  }

  private meta(requestId: string): IApiMeta {
    return { requestId, serverTime: new Date().toISOString() };
  }

  private codeForStatus(status: number): string {
    if (status === HttpStatus.UNAUTHORIZED) return ERR.UNAUTHORIZED;
    if (status === HttpStatus.NOT_FOUND) return ERR.NOT_FOUND;
    if (status === HttpStatus.TOO_MANY_REQUESTS) return ERR.RATE_LIMITED;
    if (status === HttpStatus.PAYLOAD_TOO_LARGE) return ERR.PAYLOAD_TOO_LARGE;
    if (status === HttpStatus.NOT_IMPLEMENTED) return ERR.NOT_IMPLEMENTED;
    if (status < 500) return ERR.BAD_REQUEST;
    return ERR.SERVER_ERROR;
  }
}
