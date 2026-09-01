import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from './config/config.module.js';
import { Env, NodeEnv } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { InfraModule } from './infra/infra.module.js';
import { ApiModule } from './api/api.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { QueueModule } from './queue/queue.module.js';
import { AllExceptionFilter } from './api/common/filter/all-exception.filter.js';
import { TimingInterceptor } from './api/common/interceptor/timing.interceptor.js';
import { ResponseInterceptor } from './api/common/interceptor/response.interceptor.js';

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
      useFactory: (config: ConfigService<Env, true>) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL', { infer: true }),
          // Máy dev đọc bằng mắt nên tô màu; bản thật ra JSON một dòng cho máy đọc.
          transport:
            config.get('NODE_ENV', { infer: true }) === NodeEnv.development
              ? { target: 'pino-pretty', options: { singleLine: true, translateTime: 'HH:MM:ss' } }
              : undefined,
          // Đừng để thẻ và bánh quy rơi vào log. Log bị đọc bởi nhiều người hơn
          // ta tưởng, và nó còn nằm lại rất lâu.
          redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.code'],
          autoLogging: { ignore: (req) => req.url === '/health' },
        },
      }),
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
export class AppModule {}
