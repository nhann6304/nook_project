import { describe, expect, it } from 'vitest';
import { codeMail, minutesLeft } from './code-mail.js';
import { countryNameVi, loginAlertMail } from './login-alert-mail.js';

describe('thư mã', () => {
  it('số phút làm tròn LÊN, ít nhất 1', () => {
    expect(minutesLeft(300)).toBe(5);
    expect(minutesLeft(212)).toBe(4);
    expect(minutesLeft(61)).toBe(2);
    expect(minutesLeft(5)).toBe(1);
  });

  it('gửi lại mã cũ: thư nói đúng số phút CÒN LẠI', () => {
    const mail = codeMail('493817', 'signin', 212, false);
    expect(mail.text).toContain('trong 4 phút');
    expect(mail.html).toContain('4 phút');
    expect(mail.html).not.toContain('5 phút');
  });
});

describe('thư báo đăng nhập lạ', () => {
  const at = new Date('2026-10-12T02:05:00Z');

  it('tên nước tiếng Việt, giờ Việt Nam', () => {
    expect(countryNameVi('US')).toBe('Hoa Kỳ');
    expect(countryNameVi(null)).toBeNull();
    const mail = loginAlertMail({ model: 'Pixel 8', os: 'android 15', country: 'US', at }, false);
    expect(mail.subject).toBe('Có đăng nhập mới vào LOVO');
    expect(mail.text).toContain('Hoa Kỳ');
    expect(mail.text).toContain('09:05');
    expect(mail.text).toContain('Quên mật khẩu');
  });

  it('model/os do app tự khai — thoát ký tự, không chèn được HTML', () => {
    const evil = '<img src=x onerror=alert(1)>';
    const mail = loginAlertMail({ model: evil, os: '"><script>', country: null, at }, false);
    expect(mail.html).not.toContain('<img src=x');
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('không chữ kỹ thuật trong thư', () => {
    const mail = loginAlertMail({ model: 'Pixel 8', os: null, country: 'VN', at }, true);
    for (const word of ['OTP', 'token', 'session', 'xác thực', 'hợp lệ']) {
      expect(mail.html.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });
});
