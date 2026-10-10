/**
 * Kho trạng thái đăng nhập.
 *
 * Vì sao là Zustand chứ không phải Context: Context làm MỌI component đang đọc
 * nó vẽ lại khi bất kỳ trường nào đổi. Zustand cho từng component chọn đúng
 * mẩu nó cần — đổi `pending` thì màn Camera không vẽ lại tí nào.
 * Với một app camera-first thì đây là khác biệt thấy được bằng mắt.
 *
 * Chỗ này CHƯA nối server. `sendCode`/`verify` đang là chỗ trống có chủ đích —
 * xem docs/09-frontend-backend-contract.md để biết ai sẽ lắp vào và lắp thế nào.
 */
import { create } from 'zustand';
import { LIVE, hasSession, onSessionLost } from '@/lib/http/api';
import type { SignInIntent, SignInMethod } from '../utils/identity';

export type AuthPhase = 'unknown' | 'signed-out' | 'awaiting-code' | 'signed-in';

type Pending = {
  method: SignInMethod;
  /** Chuỗi người dùng đã gõ, chưa chuẩn hoá — dùng để hiện lại cho họ soi. */
  target: string;
  /** Tạo mới / đặt lại mật khẩu — màn Nhập mã gọi đúng cửa theo chữ này. */
  intent: SignInIntent;
  /**
   * Mật khẩu vừa gõ, chờ mã để gửi kèm. CHỈ ở bộ nhớ, không ghi xuống máy;
   * `codeAccepted` / `signOut` xoá cùng `pending`.
   */
  password?: string;
};

type AuthState = {
  phase: AuthPhase;
  pending: Pending | null;
  error: string | null;
  busy: boolean;

  beginCode: (p: Pending) => void;
  codeAccepted: () => void;
  codeRejected: (message: string) => void;
  setBusy: (v: boolean) => void;
  clearError: () => void;
  signOut: () => void;
  /** Đọc thẻ đã cất: còn phiên thì vào thẳng app. Gọi một lần ở `app/_layout.tsx`. */
  hydrate: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  phase: 'unknown',
  pending: null,
  error: null,
  busy: false,

  beginCode: (pending) => set({ phase: 'awaiting-code', pending, error: null }),
  codeAccepted: () => set({ phase: 'signed-in', pending: null, error: null, busy: false }),
  codeRejected: (error) => set({ error, busy: false }),
  setBusy: (busy) => set({ busy }),
  clearError: () => set({ error: null }),
  signOut: () => set({ phase: 'signed-out', pending: null, error: null, busy: false }),
  hydrate: async () => {
    // Cả hàng giả lẫn thật đều cất thẻ trong SecureStore — tắt app mở lại vẫn vào thẳng.
    // Thẻ giả mà giờ đã nối server thật: lần gọi đầu bị 401 → `onSessionLost` → về màn Chào.
    const signedIn = await hasSession();
    if (__DEV__)
      console.log(
        `[auth] ${signedIn ? 'session found' : 'no session'} (${LIVE ? 'server' : 'mock'})`,
      );
    set({ phase: signedIn ? 'signed-in' : 'signed-out' });
  },
}));

// Thẻ dài hạn hết hạn / bị thu hồi giữa chừng → về màn Chào.
onSessionLost(() => useAuth.getState().signOut());
