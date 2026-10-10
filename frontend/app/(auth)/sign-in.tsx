/**
 * Nối màn Tạo tài khoản / Đăng nhập / Quên mật khẩu với kho trạng thái và cửa
 * gọi server (10/10/2026: có mật khẩu).
 *
 *   signin  → `login` thẳng, không mã. Chưa đặt tên thì vào màn Tên + ảnh.
 *   signup  → xin mã (intent 'signup') → màn Nhập mã gửi mã + mật khẩu.
 *   reset   → xin mã (intent 'reset')  → màn Nhập mã gửi mã + mật khẩu mới.
 *
 * Nhầm cửa thì đổi cửa TẠI CHỖ, giữ nguyên email + mật khẩu đã gõ.
 */
import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AUTH_ERR } from '@nook/shared/model/constant';
import { SignInScreen, type SignInIntent } from '@/features/auth/screens/sign-in/SignInScreen';
import { login, sendCode } from '@/features/auth/api/authApi';
import { useAuth } from '@/features/auth/store/authStore';
import type { SignInMethod } from '@/features/auth/utils/identity';

/** Server nói đứng nhầm cửa → cửa đúng. */
const RIGHT_DOOR: Record<string, SignInIntent> = {
  [AUTH_ERR.ACCOUNT_NOT_FOUND]: 'signup',
  [AUTH_ERR.ACCOUNT_EXISTS]: 'signin',
  [AUTH_ERR.PASSWORD_NOT_SET]: 'reset',
};

export default function SignIn() {
  const router = useRouter();
  const params = useLocalSearchParams<{ intent?: SignInIntent }>();
  const [intent, setIntent] = useState<SignInIntent>(params.intent ?? 'signup');
  const beginCode = useAuth((s) => s.beginCode);
  const codeAccepted = useAuth((s) => s.codeAccepted);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (method: SignInMethod, target: string, password: string) => {
      setBusy(true);
      setError(null);

      if (intent === 'signin') {
        const res = await login(method, target, password);
        setBusy(false);
        if (!res.ok) {
          const door = RIGHT_DOOR[res.code];
          if (door) setIntent(door);
          setError(res.message);
          return;
        }
        if (res.isNew) {
          router.replace('/(auth)/profile');
          return;
        }
        codeAccepted();
        router.replace('/(app)/(tabs)/home');
        return;
      }

      const res = await sendCode(method, target, intent);
      setBusy(false);
      if (!res.ok) {
        const door = RIGHT_DOOR[res.code];
        if (door) setIntent(door);
        setError(res.message);
        return;
      }
      beginCode({ method, target, intent, password });
      router.push('/(auth)/verify');
    },
    [beginCode, codeAccepted, intent, router],
  );

  const switchTo = useCallback((next: SignInIntent) => {
    setError(null);
    setIntent(next);
  }, []);

  return (
    <SignInScreen
      intent={intent}
      busy={busy}
      error={error}
      onSubmit={(m, tg, pw) => void submit(m, tg, pw)}
      onSwitch={switchTo}
    />
  );
}
