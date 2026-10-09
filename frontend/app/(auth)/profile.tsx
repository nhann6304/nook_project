/**
 * Nối màn Tên + ảnh. Lưu xong mới coi là đã đăng nhập hẳn và vào camera.
 */
import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { ProfileSetupScreen } from '@/features/profile/screens/profile-setup/ProfileSetupScreen';
import { saveProfile, type ProfileInput } from '@/features/profile/api/profileApi';
import { useProfile } from '@/features/profile/store/profileStore';
import { useAuth } from '@/features/auth/store/authStore';

export default function Profile() {
  const router = useRouter();
  const setProfile = useProfile((s) => s.set);
  const codeAccepted = useAuth((s) => s.codeAccepted);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: ProfileInput) => {
      setBusy(true);
      setError(null);
      const res = await saveProfile(input);
      setBusy(false);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setProfile(input);
      codeAccepted();
      router.replace('/(app)/(tabs)/home');
    },
    [codeAccepted, router, setProfile],
  );

  return <ProfileSetupScreen busy={busy} usernameError={error} onSubmit={(p) => void submit(p)} />;
}
