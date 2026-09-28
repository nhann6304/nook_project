import { Logger, type LogLevel } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { HEALTH_PATH } from '@nook/shared/common/constant';
import { Env, NodeEnv } from '../env/index.js';
import { NookLogger } from './nook-logger.js';

/** Đường nào chậm hơn ngần này thì nâng mức lên cho nó nổi. */
const SLOW_MS = 500;

/** LOG_LEVEL trong .env → danh sách mức mà Nest chấp nhận. */
const LEVELS: Record<string, LogLevel[]> = {
  verbose: ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'],
  debug: ['fatal', 'error', 'warn', 'log', 'debug'],
  info: ['fatal', 'error', 'warn', 'log'],
  warn: ['fatal', 'error', 'warn'],
  error: ['fatal', 'error'],
};

/**
 * Bộ ghi log — dùng thẳng `ConsoleLogger` có sẵn của Nest.
 *
 * Trước đây chỗ này dùng pino. Bỏ, vì bốn lý do, xếp theo sức nặng:
 *
 * 1. **Nhìn không ra Nest.** Dòng log của Nest có hình dạng mà ai làm Nest cũng
 *    nhận ra ngay — `[Nest] pid - giờ  LOG [Context] câu chữ +5ms`. pino in ra
 *    một kiểu khác hẳn, và cái khác đó không đổi lại được thứ gì.
 * 2. **Bốn gói ít đi.** `nestjs-pino`, `pino`, `pino-http`, `pino-pretty`.
 * 3. **Bản thật vẫn có JSON.** `json: true` là xong, không cần thư viện ngoài.
 * 4. Tốc độ của pino chỉ đáng kể ở lượng log rất lớn. Chưa tới lúc đó.
 *
 * Ống socket được tô TÍM (xem `NookLogger`) — nó là thứ hoặc nối được hoặc
 * không, và dòng của nó nằm lẫn giữa hàng trăm dòng HTTP cùng màu thì phải
 * căng mắt ra tìm.
 *
 * Log viết TIẾNG ANH và chỉ ASCII — `cmd` trên Windows chạy bảng mã cũ, chữ
 * tiếng Việt ra thành rác. Chú thích và tài liệu thì vẫn tiếng Việt.
 */
export function buildLogger(config: ConfigService<Env, true>): NookLogger {
  const isProd = config.get('NODE_ENV', { infer: true }) === NodeEnv.production;
  const level = config.get('LOG_LEVEL', { infer: true });

  return new NookLogger({
    logLevels: LEVELS[level] ?? LEVELS.info,
    // Bản thật ra JSON một dòng cho MÁY đọc; máy dev ra màu cho MẮT NGƯỜI đọc.
    json: isProd,
    colors: !isProd,
    // `+5ms` sau mỗi dòng — khoảng cách tới dòng trước. Đọc lúc khởi động là
    // thấy ngay chỗ nào tốn thời gian.
    timestamp: !isProd,
  });
}

/**
 * Một request = MỘT dòng.
 *
 *   POST /v1/auth/verify 400 48ms auth.code_invalid
 *
 * Là **hook của Fastify** chứ không phải bộ chặn của Nest, và đó là chủ ý: bộ
 * chặn chỉ chạy trên đường có controller nhận, nên 404 sẽ không được ghi lại —
 * mà 404 lại đúng là thứ đáng ghi khi app gọi sai đường.
 *
 * Mã lỗi lấy từ `req.raw` do `AllExceptionFilter` gắn vào. Nhờ vậy không phải
 * in thêm một dòng nữa chỉ để nói mã, rồi bắt người đọc tự ghép hai dòng.
 */
export function registerHttpLog(instance: FastifyInstance): void {
  const log = new Logger('HTTP');

  instance.addHook('onResponse', (req: FastifyRequest, reply: FastifyReply, done: () => void) => {
    // Bộ dò sống chết gõ cửa mỗi vài giây. Ghi lại là tự lấp đầy log bằng thứ
    // không nói lên điều gì.
    if (req.url === HEALTH_PATH) return done();

    const ms = Math.round(reply.elapsedTime);
    const why = (req.raw as { nookErrCode?: string }).nookErrCode;
    const line = `${req.method} ${req.url} ${reply.statusCode} ${ms}ms${why ? ` ${why}` : ''}`;

    if (reply.statusCode >= 500) log.error(line);
    else if (reply.statusCode >= 400) log.warn(line);
    else if (ms >= SLOW_MS) log.warn(`${line} SLOW`);
    else log.log(line);

    done();
  });
}
