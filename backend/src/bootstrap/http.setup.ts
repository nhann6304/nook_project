import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import helmet from '@fastify/helmet';
import { ERR } from '@nook/shared';
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

  // ── Lưới cuối, cho thứ KHÔNG bao giờ tới được Nest ─────────────────────────
  //
  // Bộ lọc lỗi của Nest bắt được mọi thứ trong đường của Nest. Nhưng có loại
  // hỏng xảy ra TRƯỚC đó, ở tầng Fastify — ví dụ ký tự thô chưa mã hoá trong
  // chuỗi truy vấn: bộ đọc URL ném ngay, chưa kịp có controller nào nhận.
  //
  // Không có lưới này thì mấy ca đó trả về hình dạng của Fastify
  // (`{error, message, statusCode}`) thay vì vỏ chung — và app thì chỉ có MỘT
  // lớp đọc câu trả lời. Hiếm, nhưng "hiếm" với vài chục nghìn người là mỗi
  // ngày vài lần.
  app.getHttpAdapter().getInstance().setErrorHandler((error, request, reply) => {
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    void reply.status(status).send({
      ok: false,
      code:
        status >= 500 ? ERR.SERVER_ERROR
        : status === 413 ? ERR.PAYLOAD_TOO_LARGE
        : ERR.BAD_REQUEST,
      status,
      data: null,
      metadata: {
        requestId: String(request.id ?? '-'),
        serverTime: new Date().toISOString(),
      },
    });
  });

  // Đóng kết nối tử tế khi bị dừng, thay vì cắt ngang giữa một giao dịch.
  (app as INestApplication).enableShutdownHooks();
}
