import type { ErrCode } from '../constant/error.js';
import type { MsgCode } from '../constant/message.js';

/**
 * MỘT hình dạng cho mọi câu trả lời — trót lọt cũng như hỏng.
 *
 * Vì sao bọc lại thay vì trả thẳng dữ liệu: app chỉ cần viết ĐÚNG MỘT lớp đọc
 * câu trả lời. Không bọc thì mỗi cửa trả một kiểu, và chỗ đọc phải đoán — lần
 * này là mảng, lần kia là đối tượng, lần nọ là rỗng.
 *
 *   { ok: true,  code: 'auth.code_sent', data: {...}, requestId }
 *   { ok: false, code: 'auth.code_expired', status: 410, requestId }
 *
 * `ok` là chỗ rẽ nhánh duy nhất. `code` luôn có ở cả hai nhánh, và luôn là KHOÁ
 * tra chữ chứ không phải câu chữ.
 */
export interface ApiEnvelope<T> {
  ok: true;
  /** Khoá tra chữ. Mặc định `'ok'`. */
  code: MsgCode | string;
  data: T;
  /** Dấu vết để dò lại trong log server khi có người báo lỗi. */
  requestId: string;
}

export interface ApiError {
  ok: false;
  /** Khoá tra chữ. Không bao giờ là câu tiếng Việt. */
  code: ErrCode | string;
  /** Mã HTTP, lặp lại ở thân cho tiện đọc log. */
  status: number;
  requestId: string;
  /**
   * Vài con số kèm theo, chỉ khi mã lỗi cần. Ví dụ `CODE_TOO_SOON` gửi kèm
   * `{ retryAfterSeconds: 43 }` để app đếm ngược. Không bao giờ chứa câu chữ.
   */
  detail?: Record<string, number | string | boolean>;
}

/** Thứ app nhận được từ một lần gọi, trước khi rẽ nhánh. */
export type ApiResponse<T> = ApiEnvelope<T> | ApiError;

// ── Lật trang bằng con trỏ ───────────────────────────────────────────────────

/**
 * Lật trang bằng CON TRỎ, không bằng số trang.
 *
 * Bảng tin là dòng chảy: trong lúc người ta cuộn thì có ảnh mới chen lên đầu.
 * Với `?page=2` thì mấy tấm ở ranh giới hoặc bị nhảy qua, hoặc hiện hai lần —
 * và không ai báo lỗi cả, người dùng chỉ thấy app "hơi kỳ".
 *
 * Con trỏ neo vào một ĐIỂM trong dòng chảy nên không bị chuyện đó.
 */
export interface CursorQuery {
  /** Bỏ trống là lấy từ đầu. */
  cursor?: string;
  limit?: number;
}

export interface CursorPage<T> {
  items: T[];
  /** `null` nghĩa là hết. Có giá trị thì đưa lại vào `cursor` để lấy tiếp. */
  nextCursor: string | null;
}
