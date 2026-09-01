import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { CameraScreen, type Shot } from '@/features/camera/screens/CameraScreen';
import { useMoments } from '@/features/feed/store/momentsStore';
import type { PhotoSource } from '@/features/feed/types';
import { useT } from '@i18n';
import { FRIENDS } from '@/mocks/friends';

export default function Camera() {
  const router = useRouter();
  const t = useT();
  const moments = useMoments((s) => s.moments);
  const add = useMoments((s) => s.add);

  /** Ba tấm mới nhất cho cửa nhòm ở chân màn. */
  const peekPhotos = useMemo<PhotoSource[]>(
    () => moments.slice(0, 3).map((m) => m.photo),
    [moments],
  );

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
      friends={FRIENDS}
      peekPhotos={peekPhotos}
      peekLabel={
        moments.length === 0
          ? t('camera.peekEmpty')
          : t('camera.peekSome', { count: moments.length })
      }
      peekHint={t('camera.peekHint')}
      inviteLabel={t('circle.invite')}
      onOpenCircle={() => router.push('/(app)/circle')}
      onOpenSettings={() => router.push('/(app)/settings')}
      onOpenFeed={() => router.push('/(app)/feed')}
      onSend={send}
    />
  );
}
