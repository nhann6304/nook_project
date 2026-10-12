import { Global, Module } from '@nestjs/common';
import { GeoService } from './geo.service.js';

@Global()
@Module({
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
