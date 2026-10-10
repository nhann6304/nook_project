/**
 * Cửa đăng nhập. Màn hình gọi các hàm dưới, chỉ quan tâm tới kết quả:
 * xin mã (`sendCode`), tạo tài khoản (`signup`), đăng nhập mật khẩu (`login`),
 * quên mật khẩu (`resetPassword`), và đường cũ đăng nhập bằng mã (`verifyCode`).
 *
 * `LIVE` (có `EXPO_PUBLIC_API_URL`) → gọi server thật qua `@/lib/api`.
 * Không thì hàng giả: mã đúng là `123456`, mọi mã khác bị từ chối.
 *
 * Câu lỗi tra từ MÃ server (`translateError`), không bao giờ hiện chính cái mã.
 */
import { API } from '@nook/shared/common/constant';
import type {
  ISendCodeResult,
  IUserProfile,
  IVerifyCodeResult,
} from '@nook/shared/model/interface';
import { translate, translateError } from '@i18n';
import {
  LIVE,
  call,
  clearSession,
  saveMockSession,
  saveSession,
  type ApiResult,
} from '@/lib/http/api';
import type { SignInIntent, SignInMethod } from '../utils/identity';

export type SendResult = { ok: true } | { ok: false; code: string; message: string };
export type VerifyResult =
  | { ok: true; isNew: boolean; user: IUserProfile | null }
  | { ok: false; code: string; message: string };

const FAKE_DELAY = 700;
const FAKE_CODE = '123456';
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const fail = (code: string) => ({ ok: false as const, code, message: translateError(code) });

/** Server nhận số theo dạng quốc tế; app giữ 9 số trong nước. */
const toServer = (method: SignInMethod, target: string) =>
  method === 'phone' ? `+84${target}` : target.trim().toLowerCase();

/**
 * `intent` cho server soi TRƯỚC khi gửi thư: vào cửa "đăng nhập" mà email chưa
 * có tài khoản thì trả `auth.account_not_found` ngay, không gửi mã.
 */
export async function sendCode(
  method: SignInMethod,
  target: string,
  intent: SignInIntent,
): Promise<SendResult> {
  if (!LIVE) {
    await wait(FAKE_DELAY);
    return { ok: true };
  }
  const res = await call<ISendCodeResult>(
    'POST',
    API.auth.code,
    { method, target: toServer(method, target), intent },
    { auth: false },
  );
  return res.ok ? { ok: true } : fail(res.code);
}

export async function verifyCode(
  method: SignInMethod,
  target: string,
  code: string,
  intent: SignInIntent,
): Promise<VerifyResult> {
  if (!LIVE) {
    await wait(FAKE_DELAY);
    if (code !== FAKE_CODE) {
      return { ok: false, code: 'auth.code_invalid', message: translate('verify.wrongCode') };
    }
    await saveMockSession();
    return { ok: true, isNew: intent === 'signup', user: null };
  }
  const res = await call<IVerifyCodeResult>(
    'POST',
    API.auth.verify,
    { method, target: toServer(method, target), code },
    { auth: false },
  );
  if (!res.ok) return fail(res.code);
  await saveSession(res.data);
  // `onboarded` là sự thật của server — người cũ vào cửa "tạo mới" vẫn được vào thẳng.
  return { ok: true, isNew: !res.data.user.onboarded, user: res.data.user };
}

/* ══════════════ Mật khẩu (10/10/2026) ══════════════ */

/** Đăng nhập bằng email/số + mật khẩu — không cần mã. */
export async function login(
  method: SignInMethod,
  target: string,
  password: string,
): Promise<VerifyResult> {
  if (!LIVE) {
    await wait(FAKE_DELAY);
    await saveMockSession();
    return { ok: true, isNew: false, user: null };
  }
  const res = await call<IVerifyCodeResult>(
    'POST',
    API.auth.login,
    { method, target: toServer(method, target), password },
    { auth: false },
  );
  return finish(res);
}

/** Tạo tài khoản: mã vừa gửi (intent 'signup') chứng minh email/số là của mình. */
export function signup(
  method: SignInMethod,
  target: string,
  code: string,
  password: string,
): Promise<VerifyResult> {
  return withCode(API.auth.signup, method, target, code, password, true);
}

/** Quên mật khẩu: mã (intent 'reset') + mật khẩu mới. Máy khác bị đăng xuất. */
export function resetPassword(
  method: SignInMethod,
  target: string,
  code: string,
  password: string,
): Promise<VerifyResult> {
  return withCode(API.auth.resetPassword, method, target, code, password, false);
}

async function withCode(
  path: string,
  method: SignInMethod,
  target: string,
  code: string,
  password: string,
  isNew: boolean,
): Promise<VerifyResult> {
  if (!LIVE) {
    await wait(FAKE_DELAY);
    if (code !== FAKE_CODE) {
      return { ok: false, code: 'auth.code_invalid', message: translate('verify.wrongCode') };
    }
    await saveMockSession();
    return { ok: true, isNew, user: null };
  }
  const res = await call<IVerifyCodeResult>(
    'POST',
    path,
    { method, target: toServer(method, target), code, password },
    { auth: false },
  );
  return finish(res);
}

async function finish(res: ApiResult<IVerifyCodeResult>): Promise<VerifyResult> {
  if (!res.ok) return fail(res.code);
  await saveSession(res.data);
  // `onboarded` là sự thật của server: chưa đặt tên thì vào màn Tên + ảnh.
  return { ok: true, isNew: !res.data.user.onboarded, user: res.data.user };
}

export async function signOut(): Promise<void> {
  await clearSession();
}
