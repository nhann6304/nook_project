import type { IApiEnvelope, IApiError } from '../interface/index.js';

/**
 * Thứ app nhận được từ một lần gọi, trước khi rẽ nhánh theo `ok`.
 *
 * Là `type` chứ không phải `interface` vì nó là một PHÉP HỢP của hai hình dạng.
 * `interface` không hợp được — đó cũng chính là ranh giới để chọn giữa hai thứ
 * ở dự án này: tả một hình dạng thì `interface`, ghép/biến đổi hình dạng có sẵn
 * thì `type`.
 */
export type TApiResponse<T> = IApiEnvelope<T> | IApiError;
