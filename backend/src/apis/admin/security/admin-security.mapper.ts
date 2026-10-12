import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../../../core/mapper/base.mapper.js';
import { AuthEvent, UserDevice } from '../../../database/entity/index.js';
import { AuthEventDto, UserDeviceDto } from './admin-security.dto.js';

@Injectable()
export class UserDeviceMapper extends BaseMapper<UserDevice, UserDeviceDto> {
  toDto(d: UserDevice): UserDeviceDto {
    return {
      id: d.id,
      deviceId: d.deviceId,
      model: d.model,
      os: d.os,
      appVersion: d.appVersion,
      trustedAt: d.trustedAt?.toISOString() ?? null,
      firstIp: d.firstIp,
      firstCountry: d.firstCountry,
      lastIp: d.lastIp,
      lastCountry: d.lastCountry,
      firstSeenAt: d.firstSeenAt.toISOString(),
      lastSeenAt: d.lastSeenAt.toISOString(),
    };
  }
}

@Injectable()
export class AuthEventMapper extends BaseMapper<AuthEvent, AuthEventDto> {
  toDto(e: AuthEvent): AuthEventDto {
    return {
      id: e.id,
      kind: e.kind,
      deviceId: e.deviceId,
      model: e.model,
      os: e.os,
      ip: e.ip,
      country: e.country,
      risk: e.risk,
      createdAt: e.createdAt.toISOString(),
    };
  }
}
