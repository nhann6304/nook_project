import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionFilter } from './filter/index.js';
import { ResponseInterceptor } from './interceptor/index.js';
import { RequestContextMiddleware } from './middleware/index.js';

/**
 * Khung, gói lại thành MỘT module.
 *
 * Trước đây mấy thứ này nằm rải trong `app.module.ts`: bộ lọc lỗi, bộ bọc vỏ,
 * lớp giữa. `AppModule` vì thế vừa là bản mục lục vừa là chỗ chứa cấu hình —
 * hai vai, và cái vai thứ hai thì cứ dài ra mãi.
 *
 * Nay `AppModule` chỉ liệt kê module, còn cái gì thuộc về khung thì ở đây.
 *
 * `@Global` để bộ lọc và bộ bọc vỏ áp cho MỌI cửa mà không module nào phải
 * import lại — chúng là luật chung, không phải thứ chọn dùng hay không.
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
   * Lớp giữa mở vùng `RequestContext` cho MỌI đường, trước cả cổng thẻ.
   *
   * Phải là lớp giữa chứ không phải bộ chặn: bộ chặn chạy SAU cổng thẻ, mà
   * chính cổng thẻ là chỗ gọi `setActor()` — đặt sau thì lúc cần ghi, vùng còn
   * chưa mở.
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
