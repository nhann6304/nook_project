import { Global, Module } from '@nestjs/common';
import { StorageCheckService, StorageService } from './service/index.js';

@Global()
@Module({
  providers: [StorageService, StorageCheckService],
  exports: [StorageService],
})
export class StorageModule {}
