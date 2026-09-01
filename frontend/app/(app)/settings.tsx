import { useRouter } from 'expo-router';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { FRIENDS } from '@/mocks/friends';
import { ME } from '@/mocks/moments';

export default function Settings() {
  const router = useRouter();
  return (
    <SettingsScreen name={ME.name} friendCount={FRIENDS.length} onClose={() => router.back()} />
  );
}
