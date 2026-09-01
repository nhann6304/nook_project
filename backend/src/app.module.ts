import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from './config/index.js';
import { loggerConfig } from './config/logger/index.js';
import { Env } from './config/env/index.js';
import { DatabaseModule } from './database/index.js';
import { InfraModule } from './infra/index.js';
import { ApiModule } from './api/index.js';
import { RealtimeModule } from './realtime/index.js';
import { QueueModule } from './queue/index.js';
import { AllExceptionFilter } from './api/common/filter/index.js';
import { TimingInterceptor, ResponseInterceptor } from './api/common/interceptor/index.js';
import { RequestContextMiddleware } from './api/common/middleware/index.js';

/**
 * Gốc cây. Sáu mảng, mỗi mảng một việc:
 *
 *   config/     đọc và KIỂM biến môi trường lúc bật
 *   database/   bảng, migration, kết nối
 *   infra/      thế giới bên ngoài — Redis, gửi thư, sau này là kho ảnh
 *   api/        mặt HTTP: common/ (cổng thẻ, lỗi, đăng nhập) + model/ (từng thứ một)
 *   realtime/   ống socket
 *   queue/      việc nền
 *
 * Bộ lọc lỗi và bộ đo chậm gắn ở đây, một lần, cho cả server. Gắn ở từng
 * controller là chuẩn bị sẵn một chỗ để quên.
 */
@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => loggerConfig(config),
    }),
    DatabaseModule,
    InfraModule,
    ApiModule,
    RealtimeModule,
    QueueModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionFilter },
    // Thứ tự có nghĩa: bộ đo chậm đứng ngoài để ôm trọn thời gian, bộ bọc vỏ
    // đứng trong cùng để nhận đúng thứ tay viết controller trả về.
    { provide: APP_INTERCEPTOR, useClass: TimingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule implements NestModule {
  /**
   * Lớp giữa mở vùng `RequestContext` cho MỌI đường, trước cả cổng thẻ.
   *
   * Phải là lớp giữa chứ không phải bộ chặn: bộ chặn chạy SAU cổng thẻ, mà
   * chính cổng thẻ là chỗ gọi `setActor()` — đặt sau thì lúc cần ghi, vùng
   * còn chưa mở.
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
