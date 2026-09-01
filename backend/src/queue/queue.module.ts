import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { Redis } from 'ioredis';
import { Env } from '../config/env.validation.js';

/**
 * Hàng đợi việc nền.
 *
 * Chặng này CHƯA có việc nào để làm — mới chỉ khai kết nối, để chặng sau chỉ
 * cần thêm `BullModule.registerQueue({ name: QUEUE.push })` là chạy.
 *
 * `maxRetriesPerRequest: null` là BẮT BUỘC, không phải tuỳ chọn: BullMQ dùng
 * lệnh chờ-chặn (BRPOPLPUSH), mà lệnh chờ thì ioredis đếm là "quá hạn" rồi
 * ngắt nếu có trần thử lại. Đặt con số khác `null` là hàng đợi tự sập sau vài
 * phút, và câu lỗi không chỉ về đây.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        connection: new Redis(config.get('REDIS_URL', { infer: true }), {
          maxRetriesPerRequest: null,
        }),
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2_000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 },
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
