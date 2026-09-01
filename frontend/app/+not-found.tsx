import { useRouter } from 'expo-router';
import { EmptyState, Screen } from '@ui';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <EmptyState
        title="Không tìm thấy trang này"
        message="Đường dẫn bạn vừa mở không còn nữa."
        actionLabel="Về màn chính"
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}
