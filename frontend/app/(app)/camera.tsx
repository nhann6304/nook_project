import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { CameraScreen, type Shot } from '@/features/camera/screens/CameraScreen';
import { useMoments } from '@/features/feed/store/momentsStore';
import { FRIENDS } from '@/mocks/friends';

export default function Camera() {
  const router = useRouter();
  const add = useMoments((s) => s.add);

  // Gửi xong thì đẩy sang Khoảnh khắc: người dùng thấy ngay ảnh của mình nằm
  // đầu danh sách. Không có nhịp "đã gửi rồi, giờ sao nữa?".
  const send = useCallback(
    async (shot: Shot) => {
      add(shot.uri, shot.caption, Date.now());
      router.push('/(app)/feed');
    },
    [add, router],
  );

  return (
    <CameraScreen
      friendCount={FRIENDS.length}
      onOpenCircle={() => router.push('/(app)/circle')}
      onOpenSettings={() => router.push('/(app)/settings')}
      onOpenFeed={() => router.push('/(app)/feed')}
      onSend={send}
    />
  );
}
