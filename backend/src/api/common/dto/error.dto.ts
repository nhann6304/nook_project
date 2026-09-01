import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ApiError } from '@nook/shared';

/**
 * Hình dạng DUY NHẤT của một câu trả lời hỏng. Mọi lỗi đều ra dạng này, kể cả
 * lỗi do Nest tự ném — bộ lọc `AllExceptionFilter` gom hết lại.
 */
export class ApiErrorDto implements ApiError {
  @ApiProperty({ example: false, description: 'Chỗ rẽ nhánh duy nhất khi đọc câu trả lời' })
  ok!: false;

  @ApiProperty({ example: 'auth.code_invalid', description: 'Mã tra bảng chữ ở app' })
  code!: string;

  @ApiProperty({ example: 400 })
  status!: number;

  @ApiProperty({ example: 'req-9f2c', description: 'Dấu vết để dò lại trong log' })
  requestId!: string;

  @ApiPropertyOptional({
    example: { retryAfterSeconds: 43 },
    description: 'Vài con số kèm theo, không bao giờ chứa câu chữ',
  })
  detail?: Record<string, number | string | boolean>;
}
