import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { NotificationScreen } from '@/features/notify/screens/notifications/NotificationScreen';
import { useNotify } from '@/features/notify/store/notifyStore';
import { useHomeNav } from '@/features/home/store/homeNav';
import type { Notice } from '@/features/notify/types';

export default function Notifications() {
  const router = useRouter();
  const notices = useNotify((s) => s.notices);
  const readAll = useNotify((s) => s.readAll);

  // Đánh dấu đã đọc lúc RỜI màn: còn đang xem thì mục "Mới" vẫn đứng đó.
  useEffect(() => readAll, [readAll]);

  const open = useCallback(
    (n: Notice) => {
      if (n.kind === 'invite' || n.kind === 'accepted') router.navigate('/(app)/circle');
      else if (n.kind === 'tagged') {
        router.navigate('/(app)/(tabs)/home');
        useHomeNav.getState().go('feed');
      } else router.navigate('/(app)/(tabs)/chats');
    },
    [router],
  );

  return <NotificationScreen notices={notices} onOpen={open} onClose={() => router.back()} />;
}
