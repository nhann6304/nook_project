import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyRequest } from 'fastify';
import { DEVICE_HEADER_MAX } from '@nook/shared';
import { readClientDevice } from './client-device.decorator.js';

const req = (headers: Record<string, string>, ip = '203.0.113.9') =>
  ({ headers, ip }) as unknown as FastifyRequest;

afterEach(() => {
  delete process.env.TRUST_PROXY;
});

describe('readClientDevice', () => {
  it('đọc bốn header, mã máy về chữ thường', () => {
    const d = readClientDevice(
      req({
        'x-device-id': '6F1C2A54-8A4E-4C2B-9B1E-3C7D2F0A9E11',
        'x-device-model': ' iPhone 15 Pro ',
        'x-device-os': 'ios 18.2',
        'x-app-version': '0.4.0',
      }),
    );
    expect(d).toEqual({
      deviceId: '6f1c2a54-8a4e-4c2b-9b1e-3c7d2f0a9e11',
      model: 'iPhone 15 Pro',
      os: 'ios 18.2',
      appVersion: '0.4.0',
      ip: '203.0.113.9',
      edgeCountry: null,
    });
  });

  it('mã máy không phải UUID -> null; ký tự điều khiển bị gỡ; cắt ở trần độ dài', () => {
    const d = readClientDevice(
      req({
        'x-device-id': "1' OR 1=1 --",
        'x-device-model': `Pix\u0000el‮ 8${'x'.repeat(200)}`,
      }),
    );
    expect(d.deviceId).toBeNull();
    expect(d.model!.startsWith('Pixel 8')).toBe(true);
    expect(d.model!.length).toBeLessThanOrEqual(DEVICE_HEADER_MAX);
    expect(d.os).toBeNull();
  });

  it('cf-ipcountry chỉ được tin khi có TRUST_PROXY', () => {
    expect(readClientDevice(req({ 'cf-ipcountry': 'US' })).edgeCountry).toBeNull();
    process.env.TRUST_PROXY = '127.0.0.1';
    expect(readClientDevice(req({ 'cf-ipcountry': 'us' })).edgeCountry).toBe('US');
    expect(readClientDevice(req({ 'cf-ipcountry': 'T1' })).edgeCountry).toBeNull();
    expect(readClientDevice(req({ 'cf-ipcountry': '<b>' })).edgeCountry).toBeNull();
  });
});
