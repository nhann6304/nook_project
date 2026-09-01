import { Module } from '@nestjs/common';
import { HealthController } from './controller/index.js';

@Module({ controllers: [HealthController] })
export class HealthModule {}
