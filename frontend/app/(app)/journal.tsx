import { useRouter } from 'expo-router';
import { JournalScreen } from '@/features/journal/screens/JournalScreen';
import { useJournal } from '@/features/journal/store/journalStore';

export default function Journal() {
  const router = useRouter();
  const entries = useJournal((s) => s.entries);
  return <JournalScreen entries={entries} onClose={() => router.back()} />;
}
