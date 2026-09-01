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
  @Type(() => Number) @IsInt() @Min(3600) JWT_REFRESH_TTL: number = 2_592_000;

  // ── Gửi mã ─────────────────────────────────────────────────────────────────
  @IsEnum(CodeSenderKind) CODE_SENDER: CodeSenderKind = CodeSenderKind.console;
  @IsOptional() @IsString() SMTP_URL?: string;
  @IsOptional() @IsString() SMTP_FROM?: string;

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
  if (env.NODE_ENV === NodeEnv.production && env.SWAGGER_ENABLED) {
    throw new Error('Swagger must be off in production. Set SWAGGER_ENABLED=false.');
  }

  return env;
}
