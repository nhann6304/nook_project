import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { PrivacyScreen } from '@/features/settings/screens/PrivacyScreen';
import { saveSettings } from '@/features/settings/lib/settingsApi';
import { useProfile } from '@/features/profile/store/profileStore';
import { setProfileLocked } from '@/features/profile/lib/profileApi';
import { useAudience } from '@/features/camera/store/audienceStore';
import { useCircle } from '@/features/circle/store/circleStore';

export default function Privacy() {
  const router = useRouter();
  const locked = useProfile((s) => s.locked);
  const hidden = useAudience((s) => s.defaultHidden);
  const friends = useCircle((s) => s.friends);
  const audience = useMemo(
    () => friends.map((f) => ({ id: f.id, name: f.name, uri: f.uri })),
    [friends],
  );

  const save = useCallback(
    async (nextLocked: boolean, nextHidden: readonly string[]) => {
      useAudience.getState().setDefault(nextHidden);
      if (nextLocked !== locked) {
        const res = await setProfileLocked(nextLocked);
        if (!res.ok) return res.message;
        useProfile.getState().setLocked(nextLocked);
      }
      const res = await saveSettings({
        profileLocked: nextLocked,
        hiddenFromDefault: [...nextHidden],
      });
      return res.ok ? null : res.message;
    },
    [locked],
  );

  return (
    <PrivacyScreen
      locked={locked}
      hidden={hidden}
      audience={audience}
      onSave={save}
      onBack={() => router.back()}
    />
  );
}
