import type { TErrCode } from '../../catalog/type/error.type.js';
import type { TMsgCode } from '../../catalog/type/message.type.js';

/**
 * MỘT hình dạng cho mọi câu trả lời — trót lọt cũng như hỏng.
 *
 * Vì sao bọc lại thay vì trả thẳng dữ liệu: app chỉ cần viết ĐÚNG MỘT lớp đọc
 * câu trả lời. Không bọc thì mỗi cửa trả một kiểu, và chỗ đọc phải đoán — lần
 * này là mảng, lần kia là đối tượng, lần nọ là rỗng.
 *
 *   { ok: true,  code: 'auth.code_sent',    data: {...}, requestId }
 *   { ok: false, code: 'auth.code_expired', status: 410, requestId }
 *
 * `ok` là chỗ rẽ nhánh duy nhất. `code` có ở cả hai nhánh, và luôn là KHOÁ tra
 * chữ chứ không phải câu chữ.
 */
export interface IApiEnvelope<T> {
  ok: true;
  /** Khoá tra chữ. Mặc định `'ok'`. */
  code: TMsgCode | string;
  data: T;
  /** Dấu vết để dò lại trong log server khi có người báo lỗi. */
  requestId: string;
}

export interface IApiError {
  ok: false;
  /** Khoá tra chữ. Không bao giờ là câu tiếng Việt. */
  code: TErrCode | string;
  /** Mã HTTP, lặp lại ở thân cho tiện đọc log. */
  status: number;
  requestId: string;
  /**
   * Vài con số kèm theo, chỉ khi mã lỗi cần. Ví dụ `CODE_TOO_SOON` gửi kèm
   * `{ retryAfterSeconds: 43 }` để app đếm ngược. Không bao giờ chứa câu chữ.
   */
  detail?: Record<string, number | string | boolean>;
}
