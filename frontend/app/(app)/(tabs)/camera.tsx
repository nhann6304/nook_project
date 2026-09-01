import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { CameraScreen, type Shot } from '@/features/camera/screens/CameraScreen';
import { useMoments } from '@/features/feed/store/momentsStore';
import { useT } from '@i18n';
import { FRIENDS } from '@/mocks/friends';

export default function Camera() {
  const router = useRouter();
  const t = useT();
  const add = useMoments((s) => s.add);

  // Gửi xong thì sang Khoảnh khắc: người dùng thấy ngay ảnh của mình nằm đầu
  // danh sách. Không có nhịp "đã gửi rồi, giờ sao nữa?".
  // `navigate` chứ không phải `push`: giữa các tab không được đẻ ra lịch sử.
  const send = useCallback(
    async (shot: Shot) => {
      add(shot.uri, shot.caption, Date.now());
      router.navigate('/(app)/(tabs)/feed');
    },
    [add, router],
  );

  return (
    <CameraScreen
      friends={FRIENDS}
      peekHint={t('camera.peekHint')}
      inviteLabel={t('circle.invite')}
      onOpenCircle={() => router.push('/(app)/circle')}
      onOpenSettings={() => router.push('/(app)/settings')}
      onOpenFeed={() => router.navigate('/(app)/(tabs)/feed')}
      onSend={send}
    />
  );
}
