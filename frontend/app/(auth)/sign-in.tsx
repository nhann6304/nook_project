/**
 * Nối màn Đăng nhập với kho trạng thái và với cửa gọi server.
 *
 * Màn hình (src/features/auth/screens/SignInScreen) không biết gì về router,
 * cũng không biết gì về server — nó nhận `onSubmit` rồi gọi. Nhờ vậy nó test
 * được và xem trước được mà không cần dựng cả app.
 */
import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SignInScreen, type SignInIntent } from '@/features/auth/screens/SignInScreen';
import { sendCode } from '@/features/auth/lib/authApi';
import { useAuth } from '@/features/auth/store/authStore';
import type { SignInMethod } from '@/features/auth/lib/identity';

export default function SignIn() {
  const router = useRouter();
  const { intent } = useLocalSearchParams<{ intent?: SignInIntent }>();
  const beginCode = useAuth((s) => s.beginCode);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (method: SignInMethod, target: string) => {
      setBusy(true);
      setError(null);
      const res = await sendCode(method, target);
      setBusy(false);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      beginCode({ method, target, intent: intent ?? 'signup' });
      router.push('/(auth)/verify');
    },
    [beginCode, intent, router],
  );

  return (
    <SignInScreen intent={intent ?? 'signup'} busy={busy} error={error} onSubmit={submit} />
  );
}
