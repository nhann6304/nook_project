import { afterEach, describe, expect, it, vi } from 'vitest';
import { EsmsSender, toVnLocal } from './esms.sender.js';

const env: Record<string, string> = {
  ESMS_API_KEY: 'k',
  ESMS_SECRET_KEY: 's',
  ESMS_BRANDNAME: 'LOVO',
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sender = new EsmsSender({ get: (k: string) => env[k] } as any);

function mockFetch(body: unknown) {
  const fn = vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('EsmsSender', () => {
  it('đổi E.164 về số trong nước', () => {
    expect(toVnLocal('+84901234567')).toBe('0901234567');
  });

  it('gửi số 0xxx, nội dung ASCII có mã, CodeResult 100 là xong', async () => {
    const fetch = mockFetch({ CodeResult: '100', SMSID: 'x' });
    await sender.send('phone', '+84901234567', '493817');

    const [, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      Phone: '0901234567',
      Brandname: 'LOVO',
      SmsType: '2',
      IsUnicode: '0',
    });
    expect(body.Content).toContain('493817');
    expect(body.Content).toMatch(/^[\x20-\x7e]+$/);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('CodeResult khác 100 là hỏng — kể cả khi HTTP 200', async () => {
    mockFetch({ CodeResult: '101', ErrorMessage: 'Sai ApiKey' });
    await expect(sender.send('phone', '+84901234567', '493817')).rejects.toThrow(/CodeResult=101/);
  });

  it('lỗi không lộ mã ra ngoài', async () => {
    mockFetch({ CodeResult: '99' });
    await expect(sender.send('phone', '+84901234567', '493817')).rejects.not.toThrow(/493817/);
  });
});
