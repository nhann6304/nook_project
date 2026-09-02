import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionFilter } from './filter/index.js';
import { ResponseInterceptor } from './interceptor/index.js';
import { RequestContextMiddleware } from './middleware/index.js';

/**
 * Khung gói lại thành MỘT module, để `AppModule` chỉ còn là bản mục lục.
 *
 * `@Global` vì bộ lọc lỗi và bộ bọc vỏ là luật chung, không phải thứ chọn dùng.
 */
@Global()
@Module({
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class CoreModule implements NestModule {
  /**
   * Phải là LỚP GIỮA, không phải bộ chặn: bộ chặn chạy sau cổng thẻ, mà chính
   * cổng thẻ gọi `setActor()` — đặt sau thì lúc cần ghi, vùng còn chưa mở.
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
