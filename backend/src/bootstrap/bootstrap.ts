import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DOCS_PATH, ERR } from '@nook/shared';
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

      /**
       * Lỗi ở tầng SOCKET, xảy ra trước cả khi có một request để mà xử lý.
       *
       * Ví dụ thật: ký tự thô chưa mã hoá trong chuỗi truy vấn
       * (`?username=ĐứcAnh`). Bộ đọc URL của Fastify ném ngay tại đó — chưa có
       * route, chưa có controller, nên **bộ lọc lỗi của Nest không với tới**,
       * và mặc định Fastify trả về hình dạng của riêng nó.
       *
       * Cả app chỉ có MỘT lớp đọc câu trả lời, nên chỗ này phải trả đúng vỏ
       * chung như mọi chỗ khác. Viết thẳng vào socket vì ở tầng này chưa có
       * đối tượng `reply` nào cả.
       */
      clientErrorHandler(_error, socket) {
        const body = JSON.stringify({
          ok: false,
          code: ERR.BAD_REQUEST,
          status: 400,
          data: null,
          metadata: {
            // Chưa có request thì chưa có mã dấu vết. Nói thẳng là không có,
            // hơn là bịa ra một mã không tra được trong log.
            requestId: '-',
            serverTime: new Date().toISOString(),
          },
        });
        socket.end(
          'HTTP/1.1 400 Bad Request\r\n' +
            'content-type: application/json; charset=utf-8\r\n' +
            `content-length: ${Buffer.byteLength(body)}\r\n` +
            'connection: close\r\n\r\n' +
            body,
        );
      },
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
