import { useRouter } from 'expo-router';
import { CircleScreen } from '@/features/circle/screens/CircleScreen';
import { FRIENDS } from '@/mocks/friends';

export default function Circle() {
  const router = useRouter();
  return <CircleScreen friends={FRIENDS} onInvite={() => {}} onClose={() => router.back()} />;
}
