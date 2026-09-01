import { useRouter } from 'expo-router';
import { CameraScreen } from '@/features/camera/screens/CameraScreen';
import { FRIENDS } from '@/mocks/friends';

export default function Camera() {
  const router = useRouter();
  return (
    <CameraScreen
      friendCount={FRIENDS.length}
      onOpenCircle={() => router.push('/(app)/circle')}
      onOpenSettings={() => {}}
      onOpenFeed={() => router.push('/(app)/feed')}
      onCapture={() => router.push('/(app)/feed')}
    />
  );
}
