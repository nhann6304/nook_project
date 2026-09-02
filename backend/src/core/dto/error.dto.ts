import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { IApiError } from '@nook/shared';
import { ApiMetaDto } from './envelope.dto.js';

/**
 * Hình dạng DUY NHẤT của một câu trả lời hỏng. Mọi lỗi đều ra dạng này, kể cả
 * lỗi do Nest tự ném — bộ lọc `AllExceptionFilter` gom hết lại.
 */
export class ApiErrorDto implements IApiError {
  @ApiProperty({ example: false, description: 'Chỗ rẽ nhánh duy nhất khi đọc câu trả lời' })
  ok!: false;

  @ApiProperty({ example: 'auth.code_invalid', description: 'Mã tra bảng chữ ở app' })
  code!: string;

  @ApiProperty({ example: 400 })
  status!: number;

  /**
   * Phải khai `type` tường minh. Để Swagger tự suy từ kiểu TypeScript `null`
   * thì nó không map được sang kiểu lược đồ nào, quay ra trỏ về chính lớp này
   * và báo phụ thuộc vòng tròn — server không bật lên được.
   */
  @ApiProperty({
    type: 'object',
    // Bắt buộc phải có khi khai `type: 'object'` bằng tay. `false` = không có
    // trường nào cả, đúng với thứ luôn luôn là null.
    additionalProperties: false,
    nullable: true,
    example: null,
    description: 'Luôn null — giữ hai nhánh cùng bộ trường',
  })
  data!: null;

  @ApiProperty({ type: () => ApiMetaDto })
  metadata!: ApiMetaDto;

  @ApiPropertyOptional({
    example: { retryAfterSeconds: 43 },
    description: 'Vài con số kèm theo, không bao giờ chứa câu chữ',
  })
  detail?: Record<string, number | string | boolean>;
}
