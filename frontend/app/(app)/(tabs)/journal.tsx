import { useRouter } from 'expo-router';
import { MemoriesScreen } from '@/features/journal/screens/memories/MemoriesScreen';
import { useJournal } from '@/features/journal/store/journalStore';
import { useProfile } from '@/features/profile/store/profileStore';
import { ME } from '@/mocks/moments';

export default function Journal() {
  const router = useRouter();
  const entries = useJournal((s) => s.entries);
  const myName = useProfile((s) => s.name);
  const myPhoto = useProfile((s) => s.avatarUri);
  return (
    <MemoriesScreen
      entries={entries}
      myName={myName ?? ME.name}
      myPhoto={myPhoto ?? undefined}
      onOpenMe={() => router.push('/(app)/me')}
    />
  );
}
