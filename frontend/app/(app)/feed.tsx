import { useRouter } from 'expo-router';
import { FeedScreen } from '@/features/feed/screens/FeedScreen';
import { MOMENTS } from '@/mocks/moments';

export default function Feed() {
  const router = useRouter();
  return <FeedScreen moments={MOMENTS} onOpenCamera={() => router.back()} />;
}
