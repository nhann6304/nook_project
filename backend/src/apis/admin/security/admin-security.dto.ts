import { ApiProperty } from '@nestjs/swagger';
import {
  AUTH_EVENT_KINDS,
  RISK_FLAGS,
  type IAuthEvent,
  type IUserDevice,
  type TAuthEventKind,
  type TRiskFlag,
} from '@nook/shared';

/** Một máy của một tài khoản. Model/os do app tự khai — đừng tin để cấp quyền. */
export class UserDeviceDto implements IUserDevice {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) deviceId!: string;
  @ApiProperty({ nullable: true, example: 'iPhone 15 Pro' }) model!: string | null;
  @ApiProperty({ nullable: true, example: 'ios 18.2' }) os!: string | null;
  @ApiProperty({ nullable: true, example: '0.4.0' }) appVersion!: string | null;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Đã nhập đúng mã trên máy này' })
  trustedAt!: string | null;
  @ApiProperty({ nullable: true }) firstIp!: string | null;
  @ApiProperty({ nullable: true, example: 'VN' }) firstCountry!: string | null;
  @ApiProperty({ nullable: true }) lastIp!: string | null;
  @ApiProperty({ nullable: true, example: 'VN' }) lastCountry!: string | null;
  @ApiProperty({ format: 'date-time' }) firstSeenAt!: string;
  @ApiProperty({ format: 'date-time' }) lastSeenAt!: string;
}

/** Một dòng sổ đăng nhập. */
export class AuthEventDto implements IAuthEvent {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: AUTH_EVENT_KINDS }) kind!: TAuthEventKind;
  @ApiProperty({ format: 'uuid', nullable: true }) deviceId!: string | null;
  @ApiProperty({ nullable: true }) model!: string | null;
  @ApiProperty({ nullable: true }) os!: string | null;
  @ApiProperty({ nullable: true }) ip!: string | null;
  @ApiProperty({ nullable: true, example: 'US' }) country!: string | null;
  @ApiProperty({ enum: RISK_FLAGS, isArray: true }) risk!: TRiskFlag[];
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
}
