/**
 * Cửa vào. Không vẽ gì, chỉ quyết định đi đâu.
 *
 * Tách riêng một màn cho việc này (thay vì nhét điều kiện vào _layout) để chỗ
 * quyết định "người này đã đăng nhập chưa" chỉ có ĐÚNG MỘT, đọc là thấy.
 */
import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth/store/authStore';
import { useOnboarding } from '@/features/onboarding/store/onboardingStore';

export default function Entry() {
  const phase = useAuth((s) => s.phase);
  const introSeen = useOnboarding((s) => s.introSeen);
  if (phase === 'unknown') return null;
  if (phase === 'signed-in') return <Redirect href="/(app)/(tabs)/home" />;
  // Lần mở đầu tiên: ba trang giới thiệu trước màn Chào mừng.
  return <Redirect href={introSeen ? '/(auth)/welcome' : '/(auth)/intro'} />;
}
