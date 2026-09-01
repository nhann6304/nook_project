import { Global, Module } from '@nestjs/common';
import { RedisService } from './service/index.js';

/**
 * `@Global` vì gần như tầng nào cũng chạm tới Redis. Đây là một trong vài chỗ
 * hiếm hoi mà `@Global` đỡ phiền hơn là gây rối.
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
