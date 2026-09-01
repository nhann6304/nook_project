/**
 * Cửa vào. Không vẽ gì, chỉ quyết định đi đâu.
 *
 * Tách riêng một màn cho việc này (thay vì nhét điều kiện vào _layout) để chỗ
 * quyết định "người này đã đăng nhập chưa" chỉ có ĐÚNG MỘT, đọc là thấy.
 */
import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth/store/authStore';

export default function Entry() {
  const phase = useAuth((s) => s.phase);
  if (phase === 'signed-in') return <Redirect href="/(app)/(tabs)/camera" />;
  return <Redirect href="/(auth)/welcome" />;
}
