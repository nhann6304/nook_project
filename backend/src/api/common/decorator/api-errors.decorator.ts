import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiErrorDto } from '../dto/index.js';

/**
 * Khai các mã hỏng của một đường, gọn trong một dòng.
 *
 *   @ApiErrors(400, 401, 429)
 *
 * Không có nó thì mỗi đường phải chép ba bốn `@ApiResponse` giống hệt nhau, và
 * chép tay thì sẽ có chỗ quên.
 */
export function ApiErrors(...statuses: number[]) {
  return applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({ status, type: ApiErrorDto, description: DESCRIPTION[status] ?? 'Hỏng' }),
    ),
  );
}

const DESCRIPTION: Record<number, string> = {
  400: 'Dữ liệu gửi lên không hợp lệ',
  401: 'Thiếu thẻ hoặc thẻ hỏng',
  403: 'Không có quyền',
  404: 'Không tìm thấy',
  409: 'Đụng với dữ liệu đang có',
  410: 'Đã quá hạn',
  429: 'Gọi quá dày',
  500: 'Lỗi phía server',
  501: 'Đường đã khai, ruột chưa viết',
};
