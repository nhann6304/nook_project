import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env, NodeEnv } from '../config/env/index.js';
import { ENTITIES } from './entity/index.js';
import { TransactionService } from '../core/transaction/index.js';
import { RepositoryManager } from '../core/repository/index.js';

/**
 * Kết nối cơ sở dữ liệu.
 *
 * Hai thứ cố ý:
 *
 * `synchronize: false` — luôn luôn. Bảng chỉ đổi qua migration viết tay. Bật
 * cái này lên ở bản thật là một cách mất dữ liệu rất nhanh và rất im lặng.
 *
 * `migrationsRun` — CHỈ khi `NODE_ENV=development` (10/10/2026): máy dev bật
 * `docker compose up` + `npm run dev:be` là xong, không phải nhớ chạy migration.
 * Bản thật vẫn TẮT: migration là việc riêng (dịch vụ `migrate` trong
 * compose.yml), vì nhiều bản server cùng bật mà cùng tự chạy thì đua nhau.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        type: 'postgres' as const,
        host: config.get('DB_HOST', { infer: true }),
        port: config.get('DB_PORT', { infer: true }),
        username: config.get('DB_USER', { infer: true }),
        password: config.get('DB_PASSWORD', { infer: true }),
        database: config.get('DB_NAME', { infer: true }),
        entities: ENTITIES,
        synchronize: false,
        migrations: [`${import.meta.dirname}/migration/*.{ts,js}`],
        migrationsRun: config.get('NODE_ENV', { infer: true }) === NodeEnv.development,
        logging: config.get('DB_LOGGING', { infer: true }) ? ('all' as const) : false,
        // Chết sớm còn hơn treo: mạng hỏng thì báo ngay chứ đừng chờ mãi.
        connectTimeoutMS: 5_000,
        poolSize: 10,
      }),
    }),
  ],
  // `@Global` vì hai thứ dưới đây thì module nào cũng cần: giao dịch để nhập
  // vào, và chỗ phát kho để khỏi phải viết tệp kho rỗng. Bắt từng module import
  // lại chỉ để lấy chúng là thêm nghi thức mà không thêm an toàn.
  providers: [TransactionService, RepositoryManager],
  exports: [TransactionService, RepositoryManager],
})
export class DatabaseModule {}
