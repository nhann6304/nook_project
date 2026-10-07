import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { signOut } from '@/features/auth/lib/authApi';
import { useAuth } from '@/features/auth/store/authStore';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { ACCENT_KEYS, SKY_SCENES, useTheme, type AccentKey, type SkyScene } from '@design';
import { useT } from '@i18n';
import { useCircle } from '@/features/circle/store/circleStore';
import { ME } from '@/mocks/moments';
import { useProfile } from '@/features/profile/store/profileStore';
import { setProfileLocked } from '@/features/profile/lib/profileApi';
import { useSound } from '@/features/settings/store/soundStore';
import { useAudience } from '@/features/camera/store/audienceStore';
import { checkRainNow } from '@/features/sky/lib/useRainWatch';
import { useJournal } from '@/features/journal/store/journalStore';
import { postedWithin } from '@/features/journal/types';

export default function Settings() {
  const router = useRouter();
  const leave = useAuth((s) => s.signOut);
  const t = useT();
  const friendCount = useCircle((s) => s.friends.length);
  const myName = useProfile((s) => s.name);
  const username = useProfile((s) => s.username);
  const journal = useJournal((s) => s.entries);
  const posts30 = useMemo(() => postedWithin(journal, 30), [journal]);
  const photo = useProfile((s) => s.avatarUri);
  const locked = useProfile((s) => s.locked);
  const soundOn = useSound((s) => s.on);
  const setSound = useSound((s) => s.set);
  const setLocked = useProfile((s) => s.setLocked);
  const mode = useTheme((s) => s.mode);
  const accent = useTheme((s) => s.accent);
  const setMode = useTheme((s) => s.setMode);
  const setAccent = useTheme((s) => s.setAccent);
  const rawScene = useTheme((s) => s.palette.scene);
  const scene: SkyScene | null = mode !== 'sky' ? null : rawScene === 'rainNight' ? 'rain' : rawScene;
  const friends = useCircle((s) => s.friends);
  const audience = useMemo(
    () => friends.map((f) => ({ id: f.id, name: f.name, uri: f.uri })),
    [friends],
  );
  const defaultHidden = useAudience((s) => s.defaultHidden);
  const toggleHidden = useAudience((s) => s.toggleDefault);
  const setHidden = useAudience((s) => s.setDefault);

  // Quyền vị trí đọc lại mỗi lần vào màn — có thể vừa cho ở "Tìm quanh đây".
  const [rainReady, setRainReady] = useState(false);
  useEffect(() => {
    void Location.getForegroundPermissionsAsync().then((p) => setRainReady(p.granted));
  }, []);
  const enableRain = useCallback(async () => {
    const p = await Location.requestForegroundPermissionsAsync();
    setRainReady(p.granted);
    if (p.granted) await checkRainNow().catch(() => undefined);
  }, []);

  // Đổi ngay trên màn, server hỏng thì trả lại như cũ.
  const changeLock = useCallback(
    async (next: boolean) => {
      setLocked(next);
      const res = await setProfileLocked(next);
      if (!res.ok) setLocked(!next);
    },
    [setLocked],
  );

  // Tên màu nằm ở kho chữ: "Oải hương" là chữ hiện cho người dùng, phải dịch được.
  const accentNames = useMemo(
    () =>
      Object.fromEntries(ACCENT_KEYS.map((k) => [k, t(`theme.${k}`)])) as Record<AccentKey, string>,
    [t],
  );

  const sceneNames = useMemo(
    () => Object.fromEntries(SKY_SCENES.map((k) => [k, t(`theme.${k}`)])) as Record<SkyScene, string>,
    [t],
  );

  return (
    <SettingsScreen
      scene={scene}
      sceneNames={sceneNames}
      rainReady={rainReady}
      onEnableRain={() => void enableRain()}
      audience={audience}
      defaultHidden={defaultHidden}
      onToggleHidden={toggleHidden}
      onToggleAllHidden={() => setHidden(defaultHidden.length > 0 ? [] : audience.map((p) => p.id))}
      name={myName ?? ME.name}
      username={username}
      posts30={posts30}
      photo={photo}
      friendCount={friendCount}
      mode={mode}
      onPickMode={setMode}
      accent={accent}
      accentNames={accentNames}
      onPickAccent={setAccent}
      locked={locked}
      onLockChange={(v) => void changeLock(v)}
      soundOn={soundOn}
      onSoundChange={setSound}
      onSignOut={() => {
        void signOut();
        leave();
        router.replace('/(auth)/welcome');
      }}
    />
  );
}
