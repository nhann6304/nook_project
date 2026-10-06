/**
 * Cửa DUY NHẤT ra server. Mọi `*Api.ts` đi qua đây, không ai tự `fetch`.
 *
 * ── Hai chế độ ──────────────────────────────────────────────────────────
 * Có `EXPO_PUBLIC_API_URL` (xem `frontend/.env.example`) → gọi server thật.
 * Không có → `LIVE = false`, mọi `*Api.ts` chạy hàng giả như cũ. Màn hình
 * không biết mình đang ở chế độ nào.
 *
 * ── Thẻ ─────────────────────────────────────────────────────────────────
 * Thẻ ngắn hạn chỉ ở bộ nhớ; thẻ dài hạn ở SecureStore (Keychain / Keystore),
 * không bao giờ ở AsyncStorage. Gặp 401 thì làm mới MỘT lần rồi gọi lại.
 * Làm mới là MỘT lượt cho cả app (`refreshing`): thẻ dài hạn xoay mỗi lần
 * làm mới, hai lệnh song song là lệnh sau cầm thẻ cũ → server coi là bị chép
 * và huỷ cả phiên (backend/README.md mục 1).
 */
import * as SecureStore from 'expo-secure-store';
import { API, COMMON_ERR, HTTP_STATUS } from '@nook/shared/common/constant';
import type { IApiEnvelope, IApiError } from '@nook/shared/common/interface';
import type { IAuthTokens } from '@nook/shared/model/interface';

const BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

/** Đã khai địa chỉ server chưa. `false` = chạy hàng giả. */
export const LIVE = BASE !== '';

/** Mã chỉ APP sinh ra, server không bao giờ trả. Câu chữ ở `errors.app.*`. */
export const APP_ERR = { OFFLINE: 'app.offline', TIMEOUT: 'app.timeout' } as const;

/** Mạng di động yếu vẫn kịp; lâu hơn thì người dùng đã bấm lại rồi. */
const TIMEOUT_MS = 15_000;
const REFRESH_KEY = 'nook.refresh';

export type ApiResult<T> = IApiEnvelope<T> | IApiError;
type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

let access: string | null = null;
let refreshing: Promise<boolean> | null = null;
let onLost: (() => void) | null = null;

/** Phiên mất hẳn (thẻ dài hạn hết hạn / bị thu hồi) — kho đăng nhập nghe để về màn Chào. */
export function onSessionLost(fn: () => void): void {
  onLost = fn;
}

export async function saveSession(tokens: IAuthTokens): Promise<void> {
  access = tokens.accessToken;
  await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
}

export async function hasSession(): Promise<boolean> {
  return (await SecureStore.getItemAsync(REFRESH_KEY)) !== null;
}

/** Đăng xuất: báo server thu hồi (không chờ được thì thôi), xoá thẻ trên máy. */
export async function clearSession(): Promise<void> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  access = null;
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  if (LIVE && refreshToken) void send('POST', API.auth.logout, { refreshToken }, null);
}

function fail(code: string, status = 0): IApiError {
  return {
    ok: false,
    code,
    status,
    data: null,
    metadata: { requestId: '', serverTime: new Date().toISOString() },
  };
}

async function send<T>(
  method: Method,
  path: string,
  body: unknown,
  token: string | null,
): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(BASE + path, {
      method,
      signal: ctrl.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : null),
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as ApiResult<T> | null;
    // Proxy / máy chủ trung gian trả trang HTML lỗi thì không có vỏ — tự dựng.
    return json && typeof json.ok === 'boolean' ? json : fail(COMMON_ERR.SERVER_ERROR, res.status);
  } catch {
    return fail(ctrl.signal.aborted ? APP_ERR.TIMEOUT : APP_ERR.OFFLINE);
  } finally {
    clearTimeout(timer);
  }
}

function refresh(): Promise<boolean> {
  refreshing ??= (async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!refreshToken) return false;
    const res = await send<IAuthTokens>('POST', API.auth.refresh, { refreshToken }, null);
    if (res.ok) {
      await saveSession(res.data);
      return true;
    }
    // Rớt mạng thì giữ thẻ, lần sau thử lại. Chỉ server nói "không" mới xoá.
    if (res.status === HTTP_STATUS.UNAUTHORIZED) {
      access = null;
      await SecureStore.deleteItemAsync(REFRESH_KEY);
      onLost?.();
    }
    return false;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/**
 * Gọi một đường. `auth: false` cho cửa không cần đăng nhập (xin mã, nộp mã).
 * Trả đúng cái vỏ của server — rẽ nhánh bằng `ok`, lỗi thì tra `translateError(code)`.
 */
export async function call<T>(
  method: Method,
  path: string,
  body?: unknown,
  { auth = true }: { auth?: boolean } = {},
): Promise<ApiResult<T>> {
  if (auth && access === null) await refresh();
  const first = await send<T>(method, path, body, auth ? access : null);
  if (!auth || first.ok || first.status !== HTTP_STATUS.UNAUTHORIZED) return first;
  return (await refresh()) ? send<T>(method, path, body, access) : first;
}

/** Đổi đường tương đối của server (`/v1/media/…`) thành đường đầy đủ để `<Img>` tải. */
export function absolute(url: string): string {
  return url.startsWith('/') ? BASE + url : url;
}

/** Thẻ hiện tại cho header của `<Img>`/video khi tải đường của server. */
export function authHeader(): Record<string, string> {
  return access ? { Authorization: `Bearer ${access}` } : {};
}
