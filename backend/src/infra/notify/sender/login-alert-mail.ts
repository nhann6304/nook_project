import {
  C,
  FONT,
  escapeHtml,
  mailHeading,
  mailNote,
  mailShell,
  type IMail,
} from './mail-layout.js';

/** Một lần đăng nhập lạ, đủ để kể cho chủ tài khoản. */
export interface ILoginAlert {
  /** Model/os do app tự khai qua header — chữ của NGƯỜI KHÁC, phải thoát. */
  model: string | null;
  os: string | null;
  /** ISO 3166-1 alpha-2 */
  country: string | null;
  at: Date;
}

/** Giờ trong thư là giờ Việt Nam — người dùng không biết UTC là gì. */
const TIME_ZONE = 'Asia/Ho_Chi_Minh';

/**
 * Tên nước tiếng Việt lấy từ ICU có sẵn trong Node (`Intl.DisplayNames`), không
 * tự giữ bảng: "US" → "Hoa Kỳ". Không tra được thì để nguyên mã.
 */
export function countryNameVi(code: string | null): string | null {
  if (!code) return null;
  try {
    const name = new Intl.DisplayNames(['vi'], { type: 'region' }).of(code);
    return name && name !== code && name !== 'Vùng không xác định' ? name : code;
  } catch {
    return code;
  }
}

function formatTime(at: Date): string {
  const parts = new Intl.DateTimeFormat('vi-VN', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(at);
  return `${parts} (giờ Việt Nam)`;
}

/**
 * Thư "Có đăng nhập mới vào LOVO". Không chữ kỹ thuật, không nút bấm: lối thoát
 * duy nhất là "Quên mật khẩu" ngay trong app — đặt lại là thu hồi mọi phiên.
 */
export function loginAlertMail(alert: ILoginAlert, withLogo: boolean): IMail {
  const subject = 'Có đăng nhập mới vào LOVO';
  const device = [alert.model, alert.os].filter(Boolean).join(' · ') || 'Máy không rõ tên';
  const place = countryNameVi(alert.country) ?? 'Không rõ';
  const time = formatTime(alert.at);

  const text = [
    subject,
    '',
    'Tài khoản LOVO của bạn vừa được đăng nhập từ một máy hoặc một nơi lạ.',
    `Máy: ${device}`,
    `Nơi: ${place}`,
    `Lúc: ${time}`,
    '',
    'Là bạn thì không cần làm gì cả.',
    'Không phải bạn? Đổi mật khẩu ngay trong app bằng Quên mật khẩu.',
  ].join('\n');

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;font-family:${FONT};font-size:13px;line-height:19px;color:${C.faint};width:64px;vertical-align:top">${label}</td>
        <td style="padding:6px 0;font-family:${FONT};font-size:15px;line-height:21px;font-weight:700;color:${C.text}">${escapeHtml(value)}</td></tr>`;

  const rows = `${mailHeading(subject, 'Tài khoản của bạn vừa được đăng nhập từ một máy hoặc một nơi lạ. Là bạn thì không cần làm gì cả.')}
    <tr><td style="padding:18px 32px 22px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.codeBg};border:1px solid ${C.codeBorder};border-radius:20px">
        <tr><td style="padding:14px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${row('Máy', device)}
            ${row('Nơi', place)}
            ${row('Lúc', time)}
          </table>
        </td></tr>
      </table>
    </td></tr>
    ${mailNote(`<b style="color:${C.text}">Không phải bạn?</b> Đổi mật khẩu ngay trong app bằng
          <b style="color:${C.accent}">Quên mật khẩu</b>. Mọi máy khác đang đăng nhập sẽ tự đăng xuất.`)}`;

  return {
    subject,
    text,
    html: mailShell({
      subject,
      preheader: `${escapeHtml(device)} · ${escapeHtml(place)}`,
      rows,
      withLogo,
    }),
  };
}
