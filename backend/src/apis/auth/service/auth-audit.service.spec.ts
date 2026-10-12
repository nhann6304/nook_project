import { describe, expect, it, vi } from 'vitest';
import { AuthAuditService, assessRisk, type IRiskInput } from './auth-audit.service.js';

const NOW = new Date('2026-10-12T10:00:00Z');
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);
const base: IRiskInput = {
  deviceId: 'd1',
  deviceKnown: true,
  country: 'VN',
  knownCountries: ['VN'],
  last: { country: 'VN', at: hoursAgo(1) },
  failures: 0,
  now: NOW,
};

describe('assessRisk', () => {
  it('máy quen, nước quen: không dấu hiệu nào', () => {
    expect(assessRisk(base)).toEqual([]);
  });

  it('máy lạ, hoặc app không gửi mã máy -> new_device', () => {
    expect(assessRisk({ ...base, deviceKnown: false })).toEqual(['new_device']);
    expect(assessRisk({ ...base, deviceId: null })).toEqual(['new_device']);
  });

  it('tạo ở Mỹ, 3 giờ sau vào từ Việt Nam -> new_country + impossible_travel', () => {
    expect(
      assessRisk({ ...base, knownCountries: ['US'], last: { country: 'US', at: hoursAgo(3) } }),
    ).toEqual(['new_country', 'impossible_travel']);
  });

  it('đổi nước sau hơn 6 giờ thì chỉ là nước mới', () => {
    expect(
      assessRisk({ ...base, knownCountries: ['US'], last: { country: 'US', at: hoursAgo(7) } }),
    ).toEqual(['new_country']);
  });

  it('không biết nước (IP nội bộ, chưa có tệp tra) thì im — không đoán bừa', () => {
    expect(assessRisk({ ...base, country: null, knownCountries: ['US'] })).toEqual([]);
    expect(assessRisk({ ...base, knownCountries: [], last: null })).toEqual([]);
  });

  it('5 lần sai trong một giờ -> many_failures', () => {
    expect(assessRisk({ ...base, failures: 4 })).toEqual([]);
    expect(assessRisk({ ...base, failures: 5 })).toEqual(['many_failures']);
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const any = (x: unknown) => x as any;
const CLIENT = {
  deviceId: '6f1c2a54-8a4e-4c2b-9b1e-3c7d2f0a9e11',
  model: 'Pixel 8',
  os: 'android 15',
  appVersion: '0.4.0',
  ip: '203.0.113.9',
  edgeCountry: null,
};

function build(opts: {
  devices: number;
  known: boolean;
  country?: string | null;
  prior?: string[];
}) {
  const devices = {
    count: vi.fn(async () => opts.devices),
    exists: vi.fn(async () => opts.known),
    countriesOf: vi.fn(async () => opts.prior ?? []),
    sighted: vi.fn(async () => undefined),
  };
  const events = {
    lastSuccessOf: vi.fn(async () => null),
    failuresSince: vi.fn(async () => 0),
    successCountriesOf: vi.fn(async () => []),
    create: vi.fn(async (row: object) => ({ id: 'ev1', ...row })),
  };
  const geo = { countryOf: vi.fn(() => opts.country ?? null) };
  const mail = { add: vi.fn(async () => undefined) };
  const audit = new AuthAuditService(any(devices), any(events), any(geo), any(mail));
  return { audit, devices, events, mail };
}

describe('AuthAuditService', () => {
  it('máy lạ vào tài khoản đã có máy -> ghi new_device, nhớ máy, gửi thư (qua hàng đợi)', async () => {
    const { audit, devices, events, mail } = build({ devices: 1, known: false });
    await audit.success('u1', 'login', CLIENT, false);
    expect(events.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', kind: 'login', risk: ['new_device'] }),
    );
    expect(devices.sighted).toHaveBeenCalledWith(expect.objectContaining({ trust: false }));
    expect(mail.add).toHaveBeenCalledWith('mail.login-alert', { eventId: 'ev1' });
  });

  it('tạo tài khoản: máy nào cũng mới, KHÔNG gửi thư; máy thành tin cậy', async () => {
    const { audit, devices, mail } = build({ devices: 0, known: false });
    await audit.success('u1', 'signup', CLIENT, true);
    expect(devices.sighted).toHaveBeenCalledWith(expect.objectContaining({ trust: true }));
    expect(mail.add).not.toHaveBeenCalled();
  });

  it('tài khoản chưa từng có máy (mở trước khi app gửi mã máy): không gửi thư', async () => {
    const { audit, events, mail } = build({ devices: 0, known: false });
    await audit.success('u1', 'login', CLIENT, false);
    expect(events.create).toHaveBeenCalledWith(expect.objectContaining({ risk: ['new_device'] }));
    expect(mail.add).not.toHaveBeenCalled();
  });

  it('sổ của lần tạo tài khoản không mang new_device — máy nào lúc đó cũng mới', async () => {
    const { audit, events } = build({ devices: 0, known: false });
    await audit.success('u1', 'signup', CLIENT, true);
    expect(events.create).toHaveBeenCalledWith(expect.objectContaining({ risk: [] }));
  });

  it('nước mới trên máy quen cũng báo thư', async () => {
    const { audit, mail } = build({ devices: 2, known: true, country: 'US', prior: ['VN'] });
    await audit.success('u1', 'code_login', CLIENT, true);
    expect(mail.add).toHaveBeenCalledOnce();
  });

  it('gõ sai: ghi login_failed nhưng KHÔNG nhớ máy — không thì máy kẻ dò thành máy quen', async () => {
    const { audit, devices, events } = build({ devices: 1, known: false });
    await audit.failure('u1', CLIENT);
    expect(events.create).toHaveBeenCalledWith(expect.objectContaining({ kind: 'login_failed' }));
    expect(devices.sighted).not.toHaveBeenCalled();
  });

  it('cơ sở dữ liệu hỏng thì nuốt lỗi — đăng nhập không được ngã vì sổ', async () => {
    const { audit, events } = build({ devices: 1, known: true });
    events.create.mockRejectedValueOnce(new Error('db down'));
    await expect(audit.success('u1', 'login', CLIENT, false)).resolves.toBeUndefined();
    events.create.mockRejectedValueOnce(new Error('db down'));
    await expect(audit.failure('u1', CLIENT)).resolves.toBeUndefined();
  });
});
