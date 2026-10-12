import type { TSignInIntent } from '@nook/shared';
import { MAIL_LOGO } from './mail-logo.js';

/**
 * Thư mang mã 6 số — chữ theo từng cửa (tạo tài khoản · đặt lại · đăng nhập).
 *
 * HTML viết kiểu thư điện tử: bảng lồng bảng, style nằm TRONG thẻ. Gmail bỏ
 * `<style>` ở nhiều chỗ, Outlook không hiểu flex/grid — đừng "dọn" cho gọn.
 * Chỉ khoá màu sáng: bản tối tự đảo của Gmail làm ô mã thành chữ tối trên nền
 * tối.
 *
 * Không có dữ liệu người dùng nào đi vào HTML ngoài mã (toàn chữ số), nên
 * không cần thoát ký tự. Thêm tên người dùng vào thì PHẢI thoát.
 */
export const LOGO_CID = 'lovo-logo';

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

const C = {
  page: '#EEF2F9',
  card: '#FFFFFF',
  navy: '#1D2740',
  text: '#141E36',
  muted: '#55627E',
  faint: '#7C88A2',
  codeBg: '#EEF3FC',
  codeBorder: '#D3DFF5',
  noteBg: '#F6F8FC',
  accent: '#3D6BC9',
} as const;

const FONT = `'Nunito','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
const MONO = `'SF Mono',Menlo,Consolas,'Roboto Mono',monospace`;

export function codeMail(
  code: string,
  intent: TSignInIntent | undefined,
  minutes: number,
  withLogo: boolean,
): { subject: string; text: string; html: string } {
  const copy = COPY[intent ?? 'signin'];
  const text = [
    copy.title,
    '',
    `Mã của bạn: ${code}`,
    `${copy.lead} Mã dùng được trong ${minutes} phút.`,
    '',
    'Không phải bạn? Cứ bỏ qua thư này, tài khoản của bạn vẫn an toàn.',
    'LOVO không bao giờ hỏi mã này qua điện thoại hay tin nhắn.',
  ].join('\n');

  const logo = withLogo
    ? `<img src="cid:${LOGO_CID}" width="${MAIL_LOGO.width}" height="${MAIL_LOGO.height}" alt="LOVO" style="display:block;margin:0 auto;border:0;outline:none;width:${MAIL_LOGO.width}px;height:${MAIL_LOGO.height}px">`
    : `<div style="font-family:${FONT};font-size:34px;font-weight:900;letter-spacing:2px;color:#FFFFFF">LOVO</div>`;

  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${copy.subject(code)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page}">Mã của bạn: ${code} · dùng được trong ${minutes} phút&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page}">
<tr><td align="center" style="padding:28px 14px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:460px;background:${C.card};border-radius:28px;overflow:hidden">
    <tr><td align="center" style="background:${C.navy};padding:30px 24px 26px">${logo}</td></tr>
    <tr><td style="padding:32px 32px 8px;font-family:${FONT}">
      <div style="font-size:24px;line-height:32px;font-weight:800;color:${C.text}">${copy.title}</div>
      <div style="padding-top:8px;font-size:15px;line-height:23px;color:${C.muted}">${copy.lead}</div>
    </td></tr>
    <tr><td align="center" style="padding:22px 32px 6px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background:${C.codeBg};border:1px solid ${C.codeBorder};border-radius:20px">
        <tr><td align="center" style="padding:18px 22px 18px 32px;font-family:${MONO};font-size:38px;line-height:44px;font-weight:800;letter-spacing:10px;color:${C.navy}">${code}</td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:10px 32px 26px;font-family:${FONT};font-size:13px;line-height:19px;color:${C.faint}">Mã dùng được trong <b style="color:${C.accent}">${minutes} phút</b> · chỉ dùng một lần</td></tr>
    <tr><td style="padding:0 24px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.noteBg};border-radius:18px">
        <tr><td style="padding:16px 18px;font-family:${FONT};font-size:13px;line-height:20px;color:${C.muted}">
          <b style="color:${C.text}">Không phải bạn?</b> Cứ bỏ qua thư này, tài khoản của bạn vẫn an toàn.
          LOVO không bao giờ hỏi mã này qua điện thoại hay tin nhắn, đừng đưa nó cho ai nhé.
        </td></tr>
      </table>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:460px">
    <tr><td align="center" style="padding:18px 24px 0;font-family:${FONT};font-size:12px;line-height:18px;color:${C.faint}">
      <b style="color:${C.muted}">LOVO</b> · góc nhỏ cho những người thân nhất<br>
      Thư gửi tự động, bạn không cần trả lời.
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject: copy.subject(code), text, html };
}
