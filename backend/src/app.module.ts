import { Module } from '@nestjs/common';
import { ConfigModule } from './config/index.js';
import { CoreModule } from './core/index.js';
import { DatabaseModule } from './database/index.js';
import { RepositoryModule } from './repository/index.js';
import { InfraModule } from './infra/index.js';
import { ApisModule } from './apis/index.js';
import { RealtimeModule } from './realtime/index.js';
import { QueueModule } from './queue/index.js';

/**
 * Gốc cây — chỉ là một BẢN MỤC LỤC. Không có cấu hình nào ở đây.
 *
 *   config/      đọc và KIỂM biến môi trường lúc bật
 *   core/        khung: bộ lọc lỗi, bộ bọc vỏ, lớp giữa
 *   database/    kết nối, bảng, migration
 *   repository/  kho theo bảng, dùng chung mọi khán giả
 *   infra/       thế giới bên ngoài: Redis, gửi thư, kho ảnh
 *   api/         tính năng, chia theo khán giả: auth · app · admin · health
 *   realtime/    ống socket
 *   queue/       việc nền
 *
 * Muốn biết một thứ được cấu hình ra sao thì mở module của nó. Nhét cấu hình
 * vào đây thì tệp này dài ra mãi, và nó là tệp ai cũng đọc đầu tiên.
 */
@Module({
  imports: [
    ConfigModule,
    CoreModule,
    DatabaseModule,
    RepositoryModule,
    InfraModule,
    ApisModule,
    RealtimeModule,
    QueueModule,
  ],
})
export class AppModule {}
