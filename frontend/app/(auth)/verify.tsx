import { useCallback, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { VerifyCodeScreen } from '@/features/auth/screens/VerifyCodeScreen';
import { sendCode, verifyCode } from '@/features/auth/lib/authApi';
import { useAuth } from '@/features/auth/store/authStore';

export default function Verify() {
  const router = useRouter();
  const pending = useAuth((s) => s.pending);
  const codeAccepted = useAuth((s) => s.codeAccepted);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(
    async (code: string): Promise<boolean> => {
      setBusy(true);
      setError(null);
      const res = await verifyCode(code);
      setBusy(false);
      if (!res.ok) {
        setError(res.message);
        return false;
      }
      // Người mới đặt tên + ảnh trước; người cũ vào thẳng camera. Khi có
      // server thì phân biệt bằng `onboarded` trong hồ sơ trả về, không bằng
      // cửa họ đã chọn ở màn Chào mừng.
      if (pending?.intent === 'signup') {
        router.replace('/(auth)/profile');
        return true;
      }
      codeAccepted();
      router.replace('/(app)/(tabs)/home');
      return true;
    },
    [codeAccepted, pending, router],
  );

  const resend = useCallback(() => {
    if (!pending) return;
    void sendCode(pending.method, pending.target);
  }, [pending]);

  // Vào thẳng đường dẫn này mà chưa qua màn trước thì không có gì để xác minh.
  if (!pending) return <Redirect href="/(auth)/welcome" />;

  return (
    <VerifyCodeScreen
      method={pending.method}
      target={pending.target}
      busy={busy}
      error={error}
      onVerify={verify}
      onResend={resend}
      onChangeTarget={() => router.back()}
    />
  );
}
