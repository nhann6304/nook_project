import { describe, expect, it } from 'vitest';
import { identityKey } from './identity-key.util.js';

/**
 * Hàm này quyết định "hai email có phải cùng một hộp thư không", và nó sai
 * theo HAI hướng, hai hướng đắt khác nhau:
 *
 *   gộp thiếu  -> một hộp Gmail mở được vô hạn tài khoản (nuôi tài khoản)
 *   gộp thừa   -> hai người THẬT bị nhốt chung một tài khoản (mất dữ liệu)
 *
 * Hướng thứ hai đắt hơn nhiều, nên nửa dưới của tệp này mới là phần quan trọng.
 */
describe('identityKey', () => {
  it('gộp nhãn sau dấu + về cùng một khoá', () => {
    expect(identityKey('email', 'nam+947@gmail.com')).toBe('nam@gmail.com');
    expect(identityKey('email', 'nam+a+b@example.com')).toBe('nam@example.com');
  });

  it('bỏ dấu chấm — nhưng CHỈ với Gmail', () => {
    expect(identityKey('email', 'n.a.m@gmail.com')).toBe('nam@gmail.com');
    expect(identityKey('email', 'n.a.m@googlemail.com')).toBe('nam@gmail.com');

    // Nhà cung cấp khác coi dấu chấm là ký tự có nghĩa. Gộp ở đây là nhốt hai
    // người thật vào một tài khoản.
    expect(identityKey('email', 'n.a.m@outlook.com')).toBe('n.a.m@outlook.com');
    expect(identityKey('email', 'n.a.m@yahoo.com')).toBe('n.a.m@yahoo.com');
  });

  it('chuẩn hoá hoa thường và khoảng trắng thừa', () => {
    expect(identityKey('email', '  Nam@Gmail.Com ')).toBe('nam@gmail.com');
  });

  it('giữ nguyên hai người khác nhau', () => {
    expect(identityKey('email', 'nam@gmail.com')).not.toBe(identityKey('email', 'nam2@gmail.com'));
    expect(identityKey('email', 'nam@gmail.com')).not.toBe(identityKey('email', 'nam@yahoo.com'));
  });

  it('số điện thoại thì không đụng vào', () => {
    expect(identityKey('phone', '+84901234567')).toBe('+84901234567');
    // Dấu + của E.164 KHÔNG phải nhãn — cắt ở đây là mất sạch số.
    expect(identityKey('phone', '+84901234567')).not.toBe('');
  });

  it('không trả về khoá rỗng dù gõ quái đến đâu', () => {
    // Cắt hết phần trước @ thì phải lùi về phần gốc, không được ra "@gmail.com"
    // — khoá rỗng là mọi email kiểu này đâm vào chung một tài khoản.
    expect(identityKey('email', '+abc@gmail.com')).toBe('+abc@gmail.com');
    expect(identityKey('email', '...@gmail.com')).toBe('...@gmail.com');
  });
});
