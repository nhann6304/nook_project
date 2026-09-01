/**
 * Cửa giữa giao diện và server. HIỆN TẠI LÀ HÀNG GIẢ.
 *
 * Màn hình không được biết server tồn tại. Nó gọi hai hàm dưới đây và chỉ quan
 * tâm tới kết quả. Khi backend có thật, chỉ file này đổi — không màn nào phải
 * sửa một dòng.
 *
 * Mã giả để bấm thử: 123456. Mọi mã khác đều bị từ chối.
 */
import { translate } from '@i18n';
import type { SignInMethod } from './identity';

export type SendResult = { ok: true } | { ok: false; message: string };
export type VerifyResult = { ok: true } | { ok: false; message: string };

const FAKE_DELAY = 700;
const FAKE_CODE = '123456';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function sendCode(_method: SignInMethod, _target: string): Promise<SendResult> {
  await wait(FAKE_DELAY);
  return { ok: true };
}

export async function verifyCode(code: string): Promise<VerifyResult> {
  await wait(FAKE_DELAY);
  if (code === FAKE_CODE) return { ok: true };
  // Câu lỗi lấy từ kho chữ, không viết thẳng: khi backend thật trả mã lỗi thì
  // chỗ này đổi thành tra bảng mã → khoá, còn màn hình không đụng gì.
  return { ok: false, message: translate('verify.wrongCode') };
}
