/**
 * Tên miền hộp thư dùng một lần.
 *
 * **Ở phía backend, KHÔNG ở `@nook/shared`** — gói đó bị đóng vào bản app trên
 * điện thoại, và danh sách này chỉ có server cần. Nhét vào đó là bắt mỗi người
 * dùng tải thêm vài kilobyte để chặn một thứ họ không làm.
 *
 * Danh sách này KHÔNG bao giờ đủ, và không cần đủ. Tên miền tạm mọc lên mỗi
 * ngày; cái chặn phần đuôi dài là bước hỏi bản ghi MX (`EMAIL_MX_CHECK`). Đây
 * chỉ là cái lưới bắt mấy con to nhất, vì mấy con to nhất là mấy con được dùng
 * nhiều nhất — công cụ nuôi tài khoản chọn cái nào tiện, không chọn cái nào lạ.
 *
 * Thêm tên miền vào đây là việc rẻ. Bỏ một tên miền THẬT ra khỏi đây thì đắt:
 * người dùng thật bị chặn mà không hiểu vì sao. Nghi ngờ thì đừng thêm.
 */
export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  '0-mail.com',
  '10minutemail.com',
  '10minutemail.net',
  '20minutemail.com',
  '33mail.com',
  'anonbox.net',
  'byom.de',
  'dispostable.com',
  'dropmail.me',
  'emailfake.com',
  'emailondeck.com',
  'emltmp.com',
  'fakeinbox.com',
  'fakemail.net',
  'fakemailgenerator.com',
  'getairmail.com',
  'getnada.com',
  'guerrillamail.biz',
  'guerrillamail.com',
  'guerrillamail.de',
  'guerrillamail.info',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'harakirimail.com',
  'inboxbear.com',
  'inboxkitten.com',
  'jetable.org',
  'mailcatch.com',
  'maildrop.cc',
  'mailduck.io',
  'maildux.com',
  'mailinator.com',
  'mailinator.net',
  'mailnesia.com',
  'mailsac.com',
  'mailtemp.top',
  'mintemail.com',
  'moakt.com',
  'mohmal.com',
  'mytemp.email',
  'nowmymail.com',
  'onetimeemail.net',
  'pokemail.net',
  'sharklasers.com',
  'spam4.me',
  'spambog.com',
  'spamgourmet.com',
  'temp-mail.io',
  'temp-mail.org',
  'tempail.com',
  'tempinbox.com',
  'tempm.com',
  'tempmail.dev',
  'tempmail.plus',
  'tempmailo.com',
  'tempr.email',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.de',
  'trashmail.me',
  'trbvm.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
]);
