import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { ERR } from '@nook/shared';
import { AppException } from '../error/app.exception.js';

/**
 * Bộ kiểm đầu vào, gắn toàn cục.
 *
 * `forbidNonWhitelisted: true` là chốt quan trọng nhất ở đây: gửi thừa một
 * trường không khai trong DTO thì bị từ chối thẳng, chứ không phải im lặng bỏ
 * qua. Im lặng bỏ qua nghĩa là app tưởng đã gửi, server thì không thấy, và
 * không ai biết cho tới lúc có người hỏi "sao sửa tên không ăn".
 *
 * Mặt trái phải biết trước: DTO nào suy ra từ DTO khác (`PartialType`) mà quên
 * chép validator thì trường đó thành "không khai" — biên dịch vẫn sạch, chạy
 * thật mới ngã. Cho nên DTO ở đây khai TAY từng trường một.
 */
export function buildValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    stopAtFirstError: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new AppException(ERR.BAD_REQUEST, HttpStatus.BAD_REQUEST, {
        // Tên trường, không phải câu chữ. App không hiện cái này cho ai xem —
        // nó chỉ giúp người sửa mã biết ngay chỗ nào lệch.
        fields: errors.map((e) => e.property).join(','),
      }),
  });
}
