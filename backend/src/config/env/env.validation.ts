/**
 * Kiểm biến môi trường NGAY LÚC KHỞI ĐỘNG.
 *
 * Thiếu một biến thì server chết ngay khi bật, kèm câu nói rõ thiếu cái gì.
 * Đó là chủ ý: chết lúc bật còn hơn chạy được nửa ngày rồi mới ngã ở một
 * đường ít ai gọi tới.
 */
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  development = 'development',
  test = 'test',
  production = 'production',
}

/** Mã đăng nhập đi ra bằng đường nào. */
export enum CodeSenderKind {
  /** In ra log, không gửi đi đâu cả. Chỉ dùng khi dev. */
  console = 'console',
  /** Gửi email thật qua SMTP_URL. */
  smtp = 'smtp',
}

/**
 * Mã đăng nhập qua SỐ ĐIỆN THOẠI đi bằng đường nào. Tách khỏi `CODE_SENDER`
 * vì email và SMS là hai nhà cung cấp, hai hoá đơn, bật tắt độc lập.
 */
export enum SmsSenderKind {
  /** Đóng đường số điện thoại: xin mã trả `auth.method_unavailable`. */
  off = 'off',
  /** In ra log. Chỉ dùng khi dev — bản thật không chịu bật. */
  console = 'console',
  /** eSMS.vn — brandname, rẻ cho số Việt Nam. */
  esms = 'esms',
  /** Twilio Programmable Messaging. */
  twilio = 'twilio',
}

const toBool = ({ value }: { value: unknown }): boolean =>
  value === true || value === 'true' || value === '1';

export class Env {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT: number = 4000;

  @IsString()
  HOST: string = '0.0.0.0';

  /** Danh sách nguồn được phép gọi, ngăn bằng dấu phẩy. */
  @IsString()
  APP_ORIGIN: string = 'http://localhost:8081';

  /**
   * ĐỊA CHỈ của mấy cái proxy đứng trước server. Ngăn bằng dấu phẩy.
   *
   * `req.ip` là thứ mọi cái trần chống bot đếm theo, mà Fastify lấy nó từ
   * header `X-Forwarded-For` — header do CLIENT tự gõ. Nên câu hỏi duy nhất
   * đáng hỏi là: cái máy vừa mở kết nối tới đây, có phải proxy của mình không.
   *
   *   ''                  không tin ai, lấy IP của socket (đúng khi chạy máy)
   *   '127.0.0.1'         nginx chạy cùng máy
   *   '10.0.0.0/8'        nginx trong mạng nội bộ
   *   'loopback'          tên gọi sẵn của proxy-addr, tương đương 127.0.0.1/::1
   *
   * ĐỪNG bao giờ đặt `true` hay một con số. `true` là tin mọi hop, và khi đó
   * Fastify lấy giá trị TRÁI NHẤT của `X-Forwarded-For` — tức là giá trị client
   * tự bịa; mọi trần theo IP thành đồ trang trí. Còn số hop thì bản Fastify này
   * đã bỏ hẳn (trả về "không tin gì cả"), vì đếm hop không soi được cái máy
   * đang nối tới mình là ai.
   *
   * Đọc THẲNG từ `process.env` trong `bootstrap.ts` — adapter Fastify phải
   * dựng xong trước khi có `ConfigService`. Khai ở đây để vẫn có chỗ ghi lý do.
   */
  @IsString()
  TRUST_PROXY: string = '';

  // ── Cơ sở dữ liệu ──────────────────────────────────────────────────────────
  @IsString() DB_HOST!: string;
  @Type(() => Number) @IsInt() DB_PORT!: number;
  @IsString() DB_USER!: string;
  @IsString() DB_PASSWORD!: string;
  @IsString() DB_NAME!: string;
  @Transform(toBool) @IsBoolean() DB_LOGGING: boolean = false;

  // ── Redis ──────────────────────────────────────────────────────────────────
  @IsString() REDIS_URL!: string;

  // ── Thẻ phiên ──────────────────────────────────────────────────────────────
  /** Ngắn quá thì ký cũng như không. 16 ký tự là sàn, thật thì nên 48+. */
  @IsString() @MinLength(16) JWT_ACCESS_SECRET!: string;
  @IsString() @MinLength(16) JWT_REFRESH_SECRET!: string;
  @Type(() => Number) @IsInt() @Min(60) JWT_ACCESS_TTL: number = 900;
  /**
   * Hạn thẻ dài hạn — nhưng đọc nó là "bao lâu KHÔNG mở app thì phải đăng nhập
   * lại", chứ không phải "bao lâu thì đăng nhập lại".
   *
   * Mỗi lần app làm mới thẻ, `reissue()` đẩy hạn ra xa thêm bấy nhiêu nữa. Nên
   * người dùng thật — mở app vài tháng một lần — không bao giờ phải gõ lại mã.
   * Đúng như trên điện thoại người ta quen: đăng nhập một lần rồi thôi.
   */
  @Type(() => Number) @IsInt() @Min(3600) JWT_REFRESH_TTL: number = 15_552_000;

  // ── Gửi mã ─────────────────────────────────────────────────────────────────
  @IsEnum(CodeSenderKind) CODE_SENDER: CodeSenderKind = CodeSenderKind.console;
  @IsOptional() @IsString() SMTP_URL?: string;
  @IsOptional() @IsString() SMTP_FROM?: string;

  @IsEnum(SmsSenderKind) SMS_SENDER: SmsSenderKind = SmsSenderKind.off;
  @IsOptional() @IsString() ESMS_API_KEY?: string;
  @IsOptional() @IsString() ESMS_SECRET_KEY?: string;
  /** Brandname đã đăng ký với eSMS. Nội dung tin phải khớp mẫu đã duyệt. */
  @IsOptional() @IsString() ESMS_BRANDNAME?: string;
  @IsOptional() @IsString() TWILIO_ACCOUNT_SID?: string;
  @IsOptional() @IsString() TWILIO_AUTH_TOKEN?: string;
  /** Khai MỘT trong hai: số gửi, hoặc Messaging Service (ưu tiên nếu có cả hai). */
  @IsOptional() @IsString() TWILIO_FROM?: string;
  @IsOptional() @IsString() TWILIO_MESSAGING_SERVICE_SID?: string;

  /**
   * Khoá ký mã 6 số trước khi cất vào Redis.
   *
   * Khoá RIÊNG, không xài lại khoá thẻ phiên: hai thứ khác vòng đời, khoá thẻ
   * đổi thì mọi người bị đăng xuất, còn khoá này đổi thì cùng lắm mất mấy cái
   * mã đang treo 5 phút.
   */
  @IsString() @MinLength(16) AUTH_CODE_SECRET!: string;

  /**
   * Có hỏi bản ghi MX của tên miền email không.
   *
   * Mặc định TẮT, và đó là chủ ý: bốn bài smoke dùng `@nook.test` — tên miền
   * không có thật, không có MX, bật cái này lên là cả bốn bài đỏ. Production
   * thì bật, nó chặn sạch tên miền bịa.
   */
  @Transform(toBool) @IsBoolean() EMAIL_MX_CHECK: boolean = false;

  // ── Tìm kiếm (Elasticsearch) ──────────────────────────────────────────────
  /**
   * Tắt mặc định. Postgres vẫn là nguồn thật; ES chỉ là bản sao để tìm nhanh,
   * hỏng hay tắt thì tìm kiếm lùi về Postgres.
   */
  @Transform(toBool) @IsBoolean() SEARCH_ENABLED: boolean = false;
  @IsOptional() @IsString() ELASTIC_URL?: string;
  @IsString() ELASTIC_USERNAME: string = 'elastic';
  @IsOptional() @IsString() ELASTIC_PASSWORD?: string;

  // ── Kho ảnh ────────────────────────────────────────────────────────────────
  @IsString() STORAGE_ENDPOINT!: string;
  @IsString() STORAGE_REGION: string = 'auto';
  @IsString() STORAGE_BUCKET!: string;
  @IsString() STORAGE_KEY_ID!: string;
  @IsString() STORAGE_SECRET!: string;
  /**
   * Kho CŨ — chỉ khai khi đang chuyển từ kho này sang kho khác.
   *
   * Ảnh mới luôn ghi vào kho ở trên. Ảnh cũ vẫn nằm ở kho cũ, và mỗi dòng ảnh
   * nhớ nó nằm đâu — nên khai bốn biến này là đọc được cả hai, không phải dừng
   * dịch vụ, không mất tấm nào. Chép xong hết thì bỏ đi.
   *
   * `STORAGE_PATH_STYLE` không còn: suy ra từ tên miền (xem `detectProvider`).
   */
  @IsOptional() @IsString() STORAGE_LEGACY_ENDPOINT?: string;
  @IsOptional() @IsString() STORAGE_LEGACY_BUCKET?: string;
  @IsOptional() @IsString() STORAGE_LEGACY_KEY_ID?: string;
  @IsOptional() @IsString() STORAGE_LEGACY_SECRET?: string;

  // ── Quản trị ───────────────────────────────────────────────────────────────
  /**
   * Email của tài khoản quản trị gốc.
   *
   * Không có API nào phong `root` — người đầu tiên phải tới từ bên ngoài hệ
   * thống, nếu không thì gà và trứng. Mỗi lần bật server, email này được bảo
   * đảm là `root`: chưa có thì mở tài khoản, có rồi mà sai vai thì nắn lại.
   *
   * Bỏ trống cũng được — migration đã tạo sẵn một tài khoản gốc rồi.
   */
  @IsOptional() @IsString() ROOT_ADMIN_EMAIL?: string;

  // ── Log & tài liệu ─────────────────────────────────────────────────────────
  @IsString() LOG_LEVEL: string = 'info';
  @Transform(toBool) @IsBoolean() SWAGGER_ENABLED: boolean = false;
}

export function validateEnv(raw: Record<string, unknown>): Env {
  const env = plainToInstance(Env, raw, { enableImplicitConversion: false });
  const problems = validateSync(env, { skipMissingProperties: false, whitelist: false });

  if (problems.length > 0) {
    const lines = problems.map((p) => `  ${p.property}: ${Object.values(p.constraints ?? {}).join(', ')}`);
    throw new Error(`Invalid environment variables:\n${lines.join('\n')}\n\nSee backend/.env.example.`);
  }

  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ.');
  }
  if (env.CODE_SENDER === CodeSenderKind.smtp && !env.SMTP_URL) {
    throw new Error('CODE_SENDER=smtp requires SMTP_URL.');
  }
  if (env.SMS_SENDER === SmsSenderKind.esms) {
    const missing = (['ESMS_API_KEY', 'ESMS_SECRET_KEY', 'ESMS_BRANDNAME'] as const).filter((k) => !env[k]);
    if (missing.length > 0) throw new Error(`SMS_SENDER=esms requires ${missing.join(', ')}.`);
  }
  if (env.SMS_SENDER === SmsSenderKind.twilio) {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      throw new Error('SMS_SENDER=twilio requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    }
    if (!env.TWILIO_FROM && !env.TWILIO_MESSAGING_SERVICE_SID) {
      throw new Error('SMS_SENDER=twilio requires TWILIO_FROM or TWILIO_MESSAGING_SERVICE_SID.');
    }
  }
  if (env.SEARCH_ENABLED && (!env.ELASTIC_URL || !env.ELASTIC_PASSWORD)) {
    throw new Error('SEARCH_ENABLED=true requires ELASTIC_URL and ELASTIC_PASSWORD.');
  }
  // Mã in ra log ở bản thật = ai đọc được log là đăng nhập thay được mọi số.
  if (env.NODE_ENV === NodeEnv.production && env.SMS_SENDER === SmsSenderKind.console) {
    throw new Error('SMS_SENDER=console is for development only. Use esms, twilio or off in production.');
  }
  if (env.NODE_ENV === NodeEnv.production && env.SWAGGER_ENABLED) {
    throw new Error('Swagger must be off in production. Set SWAGGER_ENABLED=false.');
  }

  return env;
}
