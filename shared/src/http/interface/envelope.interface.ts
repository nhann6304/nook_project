import type { TErrCode } from '../../catalog/type/error.type.js';
import type { TMsgCode } from '../../catalog/type/message.type.js';

/**
 * Mấy thứ nói VỀ câu trả lời, không phải bản thân dữ liệu.
 *
 * Gom riêng ra đây để `data` chỉ còn đúng thứ người ta hỏi. Trước kia con trỏ
 * lật trang nằm lẫn trong `data` cùng với danh sách, nên app phải với qua
 * `data.items` mới tới được nội dung — giờ `data` là chính cái danh sách đó.
 */
export interface IApiMeta {
  /** Dấu vết để dò lại trong log server khi có người báo lỗi. */
  requestId: string;
  /**
   * Giờ của SERVER, dạng ISO 8601.
   *
   * Có mặt ở mọi câu trả lời vì đồng hồ điện thoại lệch, và người dùng chỉnh
   * tay được. Cái gì tính theo thời gian — còn bao lâu hết hạn, bài này cũ chưa
   * — đều phải đo theo giờ này, đừng đo theo giờ máy.
   */
  serverTime: string;

  // ── Chỉ có khi câu trả lời là một DANH SÁCH ────────────────────────────────
  /** `null` là hết. Có giá trị thì đưa lại vào `cursor` để lấy tiếp. */
  nextCursor?: string | null;
  /** Còn nữa không — khỏi phải tự suy từ `nextCursor`. */
  hasMore?: boolean;
  /** Bao nhiêu món trong đúng lượt này. */
  count?: number;
}

/**
 * MỘT hình dạng cho mọi câu trả lời — trót lọt cũng như hỏng.
 *
 * Vì sao bọc lại thay vì trả thẳng dữ liệu: app chỉ cần viết ĐÚNG MỘT lớp đọc
 * câu trả lời. Không bọc thì mỗi cửa trả một kiểu, và chỗ đọc phải đoán — lần
 * này là mảng, lần kia là đối tượng, lần nọ là rỗng.
 *
 *   { ok: true,  code: 'auth.code_sent',    status: 200, data: {...}, metadata }
 *   { ok: false, code: 'auth.code_expired', status: 410, data: null,  metadata }
 *
 * Hai nhánh có CÙNG bộ trường — kể cả `data`, nhánh hỏng để `null`. App đọc
 * được mà không phải kiểm trường có tồn tại không. `ok` là chỗ rẽ nhánh duy
 * nhất. `code` có ở cả hai nhánh, và luôn là KHOÁ tra chữ chứ không phải câu
 * chữ. `status` là mã HTTP, lặp lại ở thân cho tiện đọc log và cho mấy lớp
 * mạng nuốt mất mã gốc.
 */
export interface IApiEnvelope<T> {
  ok: true;
  /** Khoá tra chữ. Mặc định `'ok'`. */
  code: TMsgCode | string;
  /** Mã HTTP. */
  status: number;
  data: T;
  metadata: IApiMeta;
}

export interface IApiError {
  ok: false;
  /** Khoá tra chữ. Không bao giờ là câu tiếng Việt. */
  code: TErrCode | string;
  /** Mã HTTP. */
  status: number;
  /** Luôn `null` — giữ cho hai nhánh cùng một bộ trường. */
  data: null;
  metadata: IApiMeta;
  /**
   * Vài con số kèm theo, chỉ khi mã lỗi cần. Ví dụ `CODE_TOO_SOON` gửi kèm
   * `{ retryAfterSeconds: 43 }` để app đếm ngược. Không bao giờ chứa câu chữ.
   */
  detail?: Record<string, number | string | boolean>;
}
