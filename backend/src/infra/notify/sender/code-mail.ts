import type { TSignInIntent } from '@nook/shared';
import { C, FONT, MONO, mailHeading, mailNote, mailShell, type IMail } from './mail-layout.js';

/**
 * Thư mang mã 6 số — chữ theo từng cửa (tạo tài khoản · đặt lại · đăng nhập).
 *
 * Không có dữ liệu người dùng nào đi vào HTML ngoài mã (toàn chữ số), nên
 * không cần thoát ký tự. Thêm tên người dùng vào thì PHẢI thoát (`escapeHtml`).
 */
type Copy = { subject: (code: string) => string; title: string; lead: string };

const COPY: Record<TSignInIntent, Copy> = {
  signup: {
    subject: (code) => `${code} là mã tạo tài khoản LOVO của bạn`,
    title: 'Sắp xong rồi!',
    lead: 'Nhập mã này trong app LOVO để tạo tài khoản. Góc nhỏ của bạn đang chờ.',
  },
  reset: {
    subject: (code) => `${code} là mã đặt lại mật khẩu LOVO`,
    title: 'Đặt lại mật khẩu',
    lead: 'Nhập mã này trong app để dùng mật khẩu mới. Các máy khác đang đăng nhập sẽ tự đăng xuất.',
  },
  signin: {
    subject: (code) => `${code} là mã đăng nhập LOVO của bạn`,
    title: 'Mã đăng nhập của bạn',
    lead: 'Nhập mã này trong app để vào LOVO.',
  },
};

/**
 * Số phút hiện trong thư, làm tròn LÊN và ít nhất 1. Gửi lại mã cũ thì mã chỉ
 * còn sống phần còn lại — 212 giây là "4 phút", không phải "5 phút".
 */
export function minutesLeft(ttlSeconds: number): number {
  return Math.max(1, Math.ceil(ttlSeconds / 60));
}

export function codeMail(
  code: string,
  intent: TSignInIntent | undefined,
  ttlSeconds: number,
  withLogo: boolean,
): IMail {
  const copy = COPY[intent ?? 'signin'];
  const minutes = minutesLeft(ttlSeconds);
  const subject = copy.subject(code);
  const text = [
    copy.title,
    '',
    `Mã của bạn: ${code}`,
    `${copy.lead} Mã dùng được trong ${minutes} phút.`,
    '',
    'Không phải bạn? Cứ bỏ qua thư này, tài khoản của bạn vẫn an toàn.',
    'LOVO không bao giờ hỏi mã này qua điện thoại hay tin nhắn.',
  ].join('\n');

  const rows = `${mailHeading(copy.title, copy.lead)}
    <tr><td align="center" style="padding:22px 32px 6px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background:${C.codeBg};border:1px solid ${C.codeBorder};border-radius:20px">
        <tr><td align="center" style="padding:18px 22px 18px 32px;font-family:${MONO};font-size:38px;line-height:44px;font-weight:800;letter-spacing:10px;color:${C.navy}">${code}</td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:10px 32px 26px;font-family:${FONT};font-size:13px;line-height:19px;color:${C.faint}">Mã dùng được trong <b style="color:${C.accent}">${minutes} phút</b> · chỉ dùng một lần</td></tr>
    ${mailNote(`<b style="color:${C.text}">Không phải bạn?</b> Cứ bỏ qua thư này, tài khoản của bạn vẫn an toàn.
          LOVO không bao giờ hỏi mã này qua điện thoại hay tin nhắn, đừng đưa nó cho ai nhé.`)}`;

  const html = mailShell({
    subject,
    preheader: `Mã của bạn: ${code} · dùng được trong ${minutes} phút`,
    rows,
    withLogo,
  });

  return { subject, text, html };
}
