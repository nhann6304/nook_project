import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { MSG } from '@nook/shared';

/**
 * Vỏ ngoài của MỌI câu trả lời trót lọt.
 *
 * Lớp này chỉ để Swagger có thứ mà vẽ. Việc bọc thật do
 * `ResponseInterceptor` làm, tự động, cho mọi cửa — không cửa nào phải tự bọc.
 *
 * Trường `data` bị GIẤU khỏi Swagger ở đây, cố ý: hình dạng của nó khác nhau ở
 * từng cửa, và `@ApiResult(Dto)` mới là chỗ ghép hình dạng thật vào (bằng
 * `allOf`). Không giấu thì bộ dựng lược đồ thấy một kiểu chung chung trỏ về
 * chính nó và báo vòng tròn — server không bật lên được.
 */
export class ApiEnvelopeDto<T = unknown> {
  @ApiProperty({ example: true, description: 'Chỗ rẽ nhánh duy nhất khi đọc câu trả lời' })
  ok!: true;

  @ApiProperty({ example: MSG.OK, description: 'Khoá tra chữ ở app, không phải câu chữ' })
  code!: string;

  @ApiProperty({ example: 'req-9f2c', description: 'Dấu vết để dò lại trong log' })
  requestId!: string;

  @ApiHideProperty()
  data!: T;
}
