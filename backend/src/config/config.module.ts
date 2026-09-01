import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnv } from './env.validation.js';

/**
 * Cấu hình dùng chung toàn server. `@Global` để khỏi phải import lại ở từng
 * module — đây là một trong vài chỗ hiếm hoi mà `@Global` xứng đáng.
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      validate: validateEnv,
    }),
  ],
})
export class ConfigModule {}
