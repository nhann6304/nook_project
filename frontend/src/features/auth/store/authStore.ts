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
import type { SignInMethod } from '../lib/identity';

export type AuthPhase = 'unknown' | 'signed-out' | 'awaiting-code' | 'signed-in';

type Pending = {
  method: SignInMethod;
  /** Chuỗi người dùng đã gõ, chưa chuẩn hoá — dùng để hiện lại cho họ soi. */
  target: string;
  /** 'signup' hay 'signin' — quyết định chữ trên màn, không quyết định luồng. */
  intent: 'signup' | 'signin';
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
};

export const useAuth = create<AuthState>((set) => ({
  phase: 'signed-out',
  pending: null,
  error: null,
  busy: false,

  beginCode: (pending) => set({ phase: 'awaiting-code', pending, error: null }),
  codeAccepted: () => set({ phase: 'signed-in', pending: null, error: null, busy: false }),
  codeRejected: (error) => set({ error, busy: false }),
  setBusy: (busy) => set({ busy }),
  clearError: () => set({ error: null }),
  signOut: () => set({ phase: 'signed-out', pending: null, error: null, busy: false }),
}));
