import { ConsoleLogger, type ConsoleLoggerOptions, type LogLevel } from '@nestjs/common';

/**
 * Mọi mã màu ANSI đang có trong một dòng.
 *
 * eslint kêu `no-control-regex` — luật đó có để bắt ký tự điều khiển lọt vào
 * do sơ ý. Ở đây thì ESC (0x1B) chính là thứ cần tìm: nó mở đầu mọi mã màu.
 */
// eslint-disable-next-line no-control-regex
const ANSI = /\x1B\[[0-9;]*m/g;

const PURPLE = '\x1B[35m';
const RESET = '\x1B[39m';

/**
 * Mấy nguồn log được tô tím.
 *
 * Ống socket khác mọi thứ còn lại ở một điểm: nó là thứ **hoặc nối được, hoặc
 * không**, và lúc đang dựng thì đó là câu hỏi hay phải trả lời nhất. Dòng của
 * nó nằm lẫn giữa hàng trăm dòng HTTP cùng màu thì phải căng mắt ra tìm.
 *
 * Tím vì `ConsoleLogger` của Nest chưa dùng màu đó: xanh lá là LOG, vàng là
 * WARN, đỏ là ERROR, xanh dương là DEBUG. Tím thì không lẫn với mức nào.
 */
const PURPLE_CONTEXTS = ['Realtime', 'WebSocketsController', 'IoAdapter'];

/**
 * Bộ ghi log của Nook — vẫn là `ConsoleLogger` của Nest, thêm đúng một thứ:
 * tô màu theo **NGUỒN**, không theo mức.
 *
 * Màu theo mức trả lời "chuyện này nặng cỡ nào". Màu theo nguồn trả lời "chuyện
 * này của ai" — và khi đang truy một mảng cụ thể thì câu hỏi thứ hai mới là
 * câu đang cần.
 */
export class NookLogger extends ConsoleLogger {
  constructor(options: ConsoleLoggerOptions) {
    super(options);
  }

  protected override formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
    timestampDiff: string,
    params?: Record<string, unknown>,
  ): string {
    const line = super.formatMessage(
      logLevel,
      message,
      pidMessage,
      formattedLogLevel,
      contextMessage,
      timestampDiff,
      params,
    );

    if (!PURPLE_CONTEXTS.some((c) => contextMessage.includes(c))) return line;

    // Gỡ hết màu cũ rồi mới tô tím. Không gỡ thì màu của Nest nằm giữa dòng,
    // và mã reset của nó trả về màu MẶC ĐỊNH — nên nửa sau dòng hết tím.
    return `${PURPLE}${line.replace(ANSI, '')}${RESET}`;
  }
}
