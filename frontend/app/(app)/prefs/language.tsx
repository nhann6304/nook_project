import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { LanguageScreen, type LocaleChoice } from '@/features/settings/screens/LanguageScreen';
import { saveSettings } from '@/features/settings/lib/settingsApi';
import { useFollowSystem, useFollowingSystem, useLocale, useSetLocale } from '@i18n';

export default function Language() {
  const router = useRouter();
  const locale = useLocale();
  const following = useFollowingSystem();
  const setLocale = useSetLocale();
  const followSystem = useFollowSystem();

  const save = useCallback(
    async (choice: LocaleChoice) => {
      if (choice === null) followSystem();
      else setLocale(choice);
      const res = await saveSettings({ locale: choice });
      return res.ok ? null : res.message;
    },
    [followSystem, setLocale],
  );

  return (
    <LanguageScreen
      current={following ? null : locale}
      onSave={save}
      onBack={() => router.back()}
    />
  );
}
