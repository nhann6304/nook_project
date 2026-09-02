import { Global, Module } from '@nestjs/common';
import { StorageService } from './service/index.js';

@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
