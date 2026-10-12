import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { DEVICE_HEADER_MAX, HEADER } from '@nook/shared';
import type { IClientDevice } from '../interface/index.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Ký tự điều khiển + ký tự định dạng vô hình (đảo chiều chữ U+202E…). */
const INVISIBLE = /[\p{Cc}\p{Cf}]/gu;
const EDGE_COUNTRY_HEADER = 'cf-ipcountry';
/** Cloudflare: `XX` = không rõ, `T1` = Tor. Không phải mã nước. */
const NOT_A_COUNTRY = new Set(['XX', 'T1']);

function clean(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return null;
  const text = value.replace(INVISIBLE, '').trim().slice(0, DEVICE_HEADER_MAX).trim();
  return text || null;
}

/** Đọc máy đang gọi ra khỏi request. Tách khỏi decorator để kiểm được. */
export function readClientDevice(req: FastifyRequest): IClientDevice {
  const h = req.headers;
  const id = clean(h[HEADER.deviceId]);

  let edgeCountry: string | null = null;
  // Cùng nguồn với `bootstrap.ts`: không có proxy của mình phía trước thì
  // `cf-ipcountry` là chữ client tự gõ.
  if (process.env.TRUST_PROXY?.trim()) {
    const cc = clean(h[EDGE_COUNTRY_HEADER])?.toUpperCase() ?? null;
    edgeCountry = cc && /^[A-Z]{2}$/.test(cc) && !NOT_A_COUNTRY.has(cc) ? cc : null;
  }

  return {
    deviceId: id && UUID.test(id) ? id.toLowerCase() : null,
    model: clean(h[HEADER.deviceModel]),
    os: clean(h[HEADER.deviceOs]),
    appVersion: clean(h[HEADER.appVersion]),
    ip: req.ip ?? null,
    edgeCountry,
  };
}

/**
 *   login(@Body() dto: LoginDto, @ClientDevice() device: IClientDevice)
 *
 * Dùng được cả trên đường `@Public()`. Đừng dựa vào nó để cho ai vào đâu.
 */
export const ClientDevice = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IClientDevice =>
    readClientDevice(ctx.switchToHttp().getRequest<FastifyRequest>()),
);
