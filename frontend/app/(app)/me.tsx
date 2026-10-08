import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { signOut } from '@/features/auth/lib/authApi';
import { useAuth } from '@/features/auth/store/authStore';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { useThemeNames } from '@/features/settings/lib/useThemeNames';
import { saveSettings } from '@/features/settings/lib/settingsApi';
import { useTheme } from '@design';
import { LOCALE_NAMES, useFollowingSystem, useLocale, useNumber, useT } from '@i18n';
import { PRO_PLANS, TRIAL_DAYS } from '@/features/pro/lib/proApi';
import { useCircle } from '@/features/circle/store/circleStore';
import { ME } from '@/mocks/moments';
import { useProfile } from '@/features/profile/store/profileStore';
import { useSound } from '@/features/settings/store/soundStore';
import { useAudience } from '@/features/camera/store/audienceStore';
import { useJournal } from '@/features/journal/store/journalStore';
import { postedWithin } from '@/features/journal/types';

export default function Me() {
  const router = useRouter();
  const t = useT();
  const names = useThemeNames();
  const leave = useAuth((s) => s.signOut);
  const friendCount = useCircle((s) => s.friends.length);
  const myName = useProfile((s) => s.name);
  const username = useProfile((s) => s.username);
  const photo = useProfile((s) => s.avatarUri);
  const locked = useProfile((s) => s.locked);
  const journal = useJournal((s) => s.entries);
  const posts30 = useMemo(() => postedWithin(journal, 30), [journal]);
  const soundOn = useSound((s) => s.on);
  const setSound = useSound((s) => s.set);
  const mode = useTheme((s) => s.mode);
  const accent = useTheme((s) => s.accent);
  const hiddenCount = useAudience((s) => s.defaultHidden.length);
  const locale = useLocale();
  const following = useFollowingSystem();
  const num = useNumber();
  const monthly = PRO_PLANS.find((p) => p.id === 'month')?.price ?? 0;

  const modeName = t(`theme.${mode}`);

  return (
    <SettingsScreen
      name={myName ?? ME.name}
      username={username}
      photo={photo}
      friendCount={friendCount}
      posts30={posts30}
      appearanceValue={`${modeName} · ${names.accent[accent]}`}
      privacyValue={[
        locked ? t('settings.pageLocked') : t('settings.pageOpen'),
        hiddenCount > 0
          ? t('settings.hiddenCount', { count: hiddenCount })
          : t('settings.everyone'),
      ].join(' · ')}
      languageValue={following ? t('settings.followPhone') : LOCALE_NAMES[locale]}
      soundOn={soundOn}
      onSoundChange={(on) => {
        // Một công tắc = một lần ghi; không cần nút Lưu.
        setSound(on);
        void saveSettings({ sound: on });
      }}
      onOpenAppearance={() => router.push('/(app)/prefs/appearance')}
      onOpenPrivacy={() => router.push('/(app)/prefs/privacy')}
      onOpenLanguage={() => router.push('/(app)/prefs/language')}
      onOpenPro={() => router.push('/(app)/pro')}
      onOpenQr={() => router.push('/(app)/qr')}
      proTitle={t('pro.card')}
      proSub={t('pro.cardSub', {
        price: t('pro.vnd', { amount: num(monthly) }),
        days: TRIAL_DAYS,
      })}
      onBack={() => router.back()}
      onSignOut={() => {
        void signOut();
        leave();
        router.replace('/(auth)/welcome');
      }}
    />
  );
}
