/**
 * Nối màn Đăng nhập với kho trạng thái và với cửa gọi server.
 *
 * Màn hình (src/features/auth/screens/SignInScreen) không biết gì về router,
 * cũng không biết gì về server — nó nhận `onSubmit` rồi gọi. Nhờ vậy nó test
 * được và xem trước được mà không cần dựng cả app.
 */
import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SignInScreen, type SignInIntent } from '@/features/auth/screens/sign-in/SignInScreen';
import { sendCode } from '@/features/auth/api/authApi';
import { useAuth } from '@/features/auth/store/authStore';
import { AUTH_ERR } from '@nook/shared/model/constant';
import type { SignInMethod } from '@/features/auth/utils/identity';

export default function SignIn() {
  const router = useRouter();
  const params = useLocalSearchParams<{ intent?: SignInIntent }>();
  // Cửa đang đứng — đổi tại chỗ khi server nói đứng nhầm, email đã gõ giữ nguyên.
  const [intent, setIntent] = useState<SignInIntent>(params.intent ?? 'signup');
  const beginCode = useAuth((s) => s.beginCode);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (method: SignInMethod, target: string) => {
      setBusy(true);
      setError(null);
      const res = await sendCode(method, target, intent);
      setBusy(false);
      if (!res.ok) {
        // Nhầm cửa: chuyển sang cửa đúng, bấm tiếp một lần là xong — không bắt
        // người ta quay ra màn Chào rồi gõ lại email.
        if (res.code === AUTH_ERR.ACCOUNT_NOT_FOUND) setIntent('signup');
        if (res.code === AUTH_ERR.ACCOUNT_EXISTS) setIntent('signin');
        setError(res.message);
        return;
      }
      beginCode({ method, target, intent });
      router.push('/(auth)/verify');
    },
    [beginCode, intent, router],
  );

  return <SignInScreen intent={intent} busy={busy} error={error} onSubmit={submit} />;
}
