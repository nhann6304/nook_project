import { MAIL_LOGO } from './mail-logo.js';

/**
 * Khung chung của mọi thư LOVO: nền, thẻ trắng, đầu navy có logo nháy mắt,
 * chân thư. Thư nào cũng chỉ việc đưa phần thân vào `mailShell`.
 *
 * HTML viết kiểu thư điện tử: bảng lồng bảng, style nằm TRONG thẻ. Gmail bỏ
 * `<style>` ở nhiều chỗ, Outlook không hiểu flex/grid — đừng "dọn" cho gọn.
 * Chỉ khoá màu sáng: bản tối tự đảo của Gmail làm ô mã thành chữ tối trên nền
 * tối.
 */
export const LOGO_CID = 'lovo-logo';

export const C = {
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

export const FONT = `'Nunito','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
export const MONO = `'SF Mono',Menlo,Consolas,'Roboto Mono',monospace`;

export interface IMail {
  subject: string;
  text: string;
  html: string;
}

/** Thoát ký tự cho mọi chữ KHÔNG do mình viết (model máy, tên…) trước khi vào HTML. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Tiêu đề + đoạn dẫn ở đầu thẻ. Cả hai là chữ của mình, không thoát. */
export function mailHeading(title: string, lead: string): string {
  return `<tr><td style="padding:32px 32px 8px;font-family:${FONT}">
      <div style="font-size:24px;line-height:32px;font-weight:800;color:${C.text}">${title}</div>
      <div style="padding-top:8px;font-size:15px;line-height:23px;color:${C.muted}">${lead}</div>
    </td></tr>`;
}

/** Ô ghi chú xám cuối thẻ. */
export function mailNote(html: string): string {
  return `<tr><td style="padding:0 24px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.noteBg};border-radius:18px">
        <tr><td style="padding:16px 18px;font-family:${FONT};font-size:13px;line-height:20px;color:${C.muted}">${html}</td></tr>
      </table>
    </td></tr>`;
}

/**
 * Bọc phần thân (các hàng `<tr>` của thẻ trắng) thành một lá thư hoàn chỉnh.
 * `preheader` là dòng xem trước hộp thư hiện cạnh tiêu đề.
 */
export function mailShell(input: {
  subject: string;
  preheader: string;
  rows: string;
  withLogo: boolean;
}): string {
  const logo = input.withLogo
    ? `<img src="cid:${LOGO_CID}" width="${MAIL_LOGO.width}" height="${MAIL_LOGO.height}" alt="LOVO" style="display:block;margin:0 auto;border:0;outline:none;width:${MAIL_LOGO.width}px;height:${MAIL_LOGO.height}px">`
    : `<div style="font-family:${FONT};font-size:34px;font-weight:900;letter-spacing:2px;color:#FFFFFF">LOVO</div>`;

  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${input.subject}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page}">${input.preheader}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page}">
<tr><td align="center" style="padding:28px 14px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:460px;background:${C.card};border-radius:28px;overflow:hidden">
    <tr><td align="center" style="background:${C.navy};padding:30px 24px 26px">${logo}</td></tr>
    ${input.rows}
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
}
