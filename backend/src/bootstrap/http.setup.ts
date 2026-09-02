import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import helmet from '@fastify/helmet';
import { Env } from '../config/env/index.js';
import { registerHttpLog } from '../config/logger/index.js';
import { buildValidationPipe } from '../core/pipe/index.js';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

/**
 * Mấy thứ gắn vào tầng HTTP: mũ bảo hiểm, nguồn được phép gọi, bộ kiểm đầu
 * vào, và dòng log cho mỗi request.
 *
 * Tách khỏi `main.ts` để `main.ts` chỉ còn là chỗ GỌI RA. Một tệp khởi động
 * dài bốn chục dòng là tệp mà ai cũng thêm "một thứ nhỏ" vào, và ba tháng sau
 * không ai đọc nổi thứ tự các bước.
 */
export async function setupHttp(
  app: NestFastifyApplication,
  config: ConfigService<Env, true>,
): Promise<void> {
  // `contentSecurityPolicy: false`: trang Swagger nạp script và style của
  // chính nó, chính sách mặc định chặn thẳng. API thuần JSON thì CSP không
  // che chắn được gì thêm.
  await app.register(helmet, { contentSecurityPolicy: false });

  app.enableCors({
    origin: config
      .get('APP_ORIGIN', { infer: true })
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(buildValidationPipe());

  // Một request = một dòng log. Là hook của Fastify chứ không phải bộ chặn của
  // Nest, để 404 cũng được ghi — bộ chặn chỉ chạy khi có controller nhận.
  registerHttpLog(app.getHttpAdapter().getInstance());

  // Đóng kết nối tử tế khi bị dừng, thay vì cắt ngang giữa một giao dịch.
  (app as INestApplication).enableShutdownHooks();
}
