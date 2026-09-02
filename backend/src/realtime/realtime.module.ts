import { Module } from '@nestjs/common';
import { AuthModule } from '../apis/auth/index.js';
import { RealtimeGateway } from './gateway/index.js';

/**
 * Ống realtime đứng RIÊNG, không nằm trong `api/`.
 *
 * Vì nó không phải một cửa HTTP: không có DTO, không có Swagger, không có mã
 * lỗi trả về. Nhét nó vào `api/model/` là làm mờ đúng cái ranh giới mà cả cây
 * thư mục này dựng ra để giữ.
 */
@Module({
  imports: [AuthModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
