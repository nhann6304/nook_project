import type { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Params } from 'nestjs-pino';
import { HEALTH_PATH } from '@nook/shared/http';
import { Env, NodeEnv } from '../env/index.js';

/**
 * Cách server nói chuyện ra màn hình.
 *
 * Hai mặt, cùng một dòng dữ liệu:
 *
 *   dev   một dòng ngắn cho MẮT NGƯỜI đọc
 *         10:13:07  LOG  [RouterExplorer] Mapped {/v1/auth/code, POST} route
 *         10:13:08  INFO [HTTP] GET /health → 200 · 9ms
 *
 *   thật  JSON một dòng cho MÁY đọc — để `grep`, để đẩy vào chỗ gom log
 *
 * Vì sao không in cả đống chi tiết ở máy dev: log mà mỗi request chiếm mười
 * dòng thì không ai đọc, và không đọc thì bằng không có. Chi tiết vẫn còn
 * nguyên ở bản thật, chỗ người ta thật sự đi tìm.
 */
/**
 * Một dòng cho một request. **Chỉ ASCII** — không mũi tên, không dấu chấm giữa.
 *
 * Windows: `cmd` mặc định chạy bảng mã cũ, ký tự ngoài ASCII ra thành rác. Có
 * `chcp 65001` trong mấy tệp `.bat` rồi, nhưng người ta còn mở log ở chỗ khác —
 * cửa sổ khác, tệp log, chỗ gom log. Giữ ASCII là hết lo, ở mọi chỗ.
 */
function line(req: unknown, status: number, ms?: number): string {
  const raw = req as FastifyRequest['raw'] & { nookErrCode?: string };
  const took = ms === undefined ? '' : ` ${Math.round(ms)}ms`;
  const why = raw.nookErrCode ? ` ${raw.nookErrCode}` : '';
  return `${raw.method} ${raw.url} ${status}${took}${why}`;
}

export function loggerConfig(config: ConfigService<Env, true>): Params {
  const isDev = config.get('NODE_ENV', { infer: true }) === NodeEnv.development;

  return {
    pinoHttp: {
      level: config.get('LOG_LEVEL', { infer: true }),

      // ── Hình dạng ở máy dev ────────────────────────────────────────────────
      transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:HH:MM:ss',
              // Mấy thứ này đã nằm trong câu chữ rồi, in lại là in đôi.
              ignore: 'pid,hostname,context,req,res,responseTime,reqId',
              messageFormat: '{if context}[{context}] {end}{msg}',
            },
          }
        : undefined,

      // ── Một request = MỘT dòng ─────────────────────────────────────────────
      //
      //   POST /v1/auth/verify 400 48ms auth.code_invalid
      //
      // Mã lỗi do `AllExceptionFilter` gắn lên request. Nhờ vậy không phải in
      // thêm một dòng nữa chỉ để nói mã, rồi bắt người đọc tự ghép hai dòng.
      customSuccessMessage: (req, res, responseTime) => line(req, res.statusCode, responseTime),
      customErrorMessage: (req, res) => line(req, res.statusCode),
      customProps: () => ({ context: 'HTTP' }),

      /** Chậm thì nâng mức lên để nó nổi trong biển dòng. */
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },

      // ── Cắt bớt thứ đi kèm ─────────────────────────────────────────────────
      //
      // Mặc định pino-http nhét NGUYÊN bộ header của request và response vào
      // mỗi dòng. Hai chuyện cùng lúc: log phình ra không đọc nổi, và thẻ phiên
      // rơi vào log. `redact` che được chữ, nhưng không in ra thì gọn hơn nhiều.
      serializers: {
        req: (req: FastifyRequest['raw'] & { id?: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: FastifyReply['raw']) => ({ statusCode: res.statusCode }),
      },
      redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.code'],

      autoLogging: {
        // Bộ dò sống chết gõ cửa mỗi vài giây. Ghi lại là tự lấp đầy log bằng
        // thứ không nói lên điều gì.
        ignore: (req) => req.url === HEALTH_PATH,
      },
    },
  };
}
