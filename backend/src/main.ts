import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import { DOCS_PATH } from '@nook/shared';
import { AppModule } from './app.module.js';
import { Env, NodeEnv } from './config/env/index.js';
import { setupSwagger } from './config/swagger/index.js';
import { buildValidationPipe } from './api/common/pipe/index.js';
import { RedisIoAdapter } from './realtime/adapter/index.js';
import { RedisService } from './infra/redis/service/index.js';

async function bootstrap(): Promise<void> {
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

  app.useLogger(app.get(PinoLogger));
  const config = app.get(ConfigService<Env, true>);
  const log = new Logger('Bootstrap');

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie);

  app.enableCors({
    origin: config
      .get('APP_ORIGIN', { infer: true })
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(buildValidationPipe());

  // Cầu Redis cho socket: một bản server thì thừa, hai bản trở lên thì thiếu nó
  // là tin nhắn chỉ tới được nửa số người.
  const io = new RedisIoAdapter(app);
  io.connectToRedis(app.get(RedisService));
  app.useWebSocketAdapter(io);

  if (config.get('SWAGGER_ENABLED', { infer: true })) setupSwagger(app);

  // Đóng kết nối tử tế khi bị dừng, thay vì cắt ngang giữa một giao dịch.
  app.enableShutdownHooks();

  const port = config.get('PORT', { infer: true });
  const host = config.get('HOST', { infer: true });
  await app.listen(port, host);

  log.log(`Nook API   http://localhost:${port}`);
  if (config.get('NODE_ENV', { infer: true }) === NodeEnv.development) {
    log.log(`Swagger    http://localhost:${port}${DOCS_PATH}`);
  }
}

void bootstrap();
