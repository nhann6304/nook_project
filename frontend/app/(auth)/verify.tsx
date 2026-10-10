/**
 * Màn Nhập mã: mã + mật khẩu đã gõ ở màn trước → tạo tài khoản hoặc đổi mật
 * khẩu. Người mới (chưa đặt tên) sang màn Tên + ảnh, người cũ vào thẳng app.
 */
import { useCallback, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { VerifyCodeScreen } from '@/features/auth/screens/verify-code/VerifyCodeScreen';
import { resetPassword, sendCode, signup, verifyCode } from '@/features/auth/api/authApi';
import { useAuth } from '@/features/auth/store/authStore';

export default function Verify() {
  const router = useRouter();
  const pending = useAuth((s) => s.pending);
  const codeAccepted = useAuth((s) => s.codeAccepted);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(
    async (code: string): Promise<boolean> => {
      if (!pending) return false;
      setBusy(true);
      setError(null);
      // Có mật khẩu đi kèm (10/10/2026): tạo tài khoản / đặt lại mật khẩu bằng
      // mã. Không có thì đường cũ — đăng nhập bằng mã.
      const { method, target, intent, password } = pending;
      const res =
        password && intent === 'signup'
          ? await signup(method, target, code, password)
          : password && intent === 'reset'
            ? await resetPassword(method, target, code, password)
            : await verifyCode(method, target, code, intent);
      setBusy(false);
      if (!res.ok) {
        setError(res.message);
        return false;
      }
      // Người mới đặt tên + ảnh trước; người cũ vào thẳng camera. `isNew` lấy
      // từ `onboarded` của server, không từ cửa họ đã chọn ở màn Chào mừng.
      if (res.isNew) {
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
    void sendCode(pending.method, pending.target, pending.intent);
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
