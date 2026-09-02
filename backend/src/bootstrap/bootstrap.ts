import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DOCS_PATH } from '@nook/shared';
import { AppModule } from '../app.module.js';
import { Env, NodeEnv } from '../config/env/index.js';
import { buildLogger } from '../config/logger/index.js';
import { setupSwagger } from '../config/swagger/index.js';
import { setupHttp } from './http.setup.js';
import { setupRealtime } from './realtime.setup.js';

/**
 * Bật server. Đọc từ trên xuống là thấy đủ thứ tự các bước, không hơn.
 *
 * Mỗi bước là một hàm ở tệp riêng. Chi tiết của bước nào thì nằm trong bước đó.
 */
export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      // Đứng sau nginx thì `req.ip` phải là IP người dùng, không phải IP nginx.
      trustProxy: true,
      bodyLimit: 1_048_576,
    }),
    // Gom log lúc khởi động lại, chờ tới khi bộ ghi log thật sẵn sàng — nếu
    // không thì mấy dòng đầu tiên, chính là mấy dòng hay hỏng nhất, bị mất.
    { bufferLogs: true },
  );

  const config = app.get(ConfigService<Env, true>);
  app.useLogger(buildLogger(config));

  await setupHttp(app, config);
  setupRealtime(app);
  if (config.get('SWAGGER_ENABLED', { infer: true })) setupSwagger(app);

  const port = config.get('PORT', { infer: true });
  await app.listen(port, config.get('HOST', { infer: true }));

  const log = new Logger('Bootstrap');
  log.log(`Nook API   http://localhost:${port}`);
  if (config.get('NODE_ENV', { infer: true }) === NodeEnv.development) {
    log.log(`Swagger    http://localhost:${port}${DOCS_PATH}`);
  }
}
