import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from '../config/env/index.js';
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
 * `migrationsRun: false` — server không tự chạy migration lúc bật. Chạy
 * migration là một việc riêng, có người bấm, biết trước sẽ đổi gì. Hai bản
 * server cùng bật một lúc mà cùng tự chạy migration thì đua nhau.
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
        migrationsRun: false,
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
