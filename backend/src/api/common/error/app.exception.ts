import { HttpException, HttpStatus } from '@nestjs/common';
import type { TErrCode } from '@nook/shared';

/**
 * Lỗi của mình, ném ra bằng MÃ.
 *
 * Cả server không có một câu tiếng Việt nào đi ra ngoài. App nhận mã rồi tra
 * bảng chữ của nó — vì server không biết máy người dùng đang để tiếng gì, và
 * cũng không nên biết.
 *
 *   throw new AppException(ERR.CODE_EXPIRED, HttpStatus.GONE);
 *   throw new AppException(ERR.CODE_TOO_SOON, HttpStatus.TOO_MANY_REQUESTS, { retryAfterSeconds: 43 });
 *
 * `detail` chỉ chứa CON SỐ để app đếm ngược hay vẽ thanh, không chứa câu chữ.
 */
export class AppException extends HttpException {
  constructor(
    public readonly code: TErrCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly detail?: Record<string, number | string | boolean>,
  ) {
    super({ code, status, detail }, status);
  }
}
