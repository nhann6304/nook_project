import { CircleScreen } from '@/features/circle/screens/CircleScreen';
import { FRIENDS } from '@/mocks/friends';

export default function Circle() {
  return <CircleScreen friends={FRIENDS} onInvite={() => {}} />;
}
