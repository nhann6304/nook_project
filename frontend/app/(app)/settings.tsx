import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { PALETTE_KEYS, SKY_KEYS, useTheme, type PaletteKey, type SkyKey } from '@design';
import { useT } from '@i18n';
import { useCircle } from '@/features/circle/store/circleStore';
import { ME } from '@/mocks/moments';
import { useProfile } from '@/features/profile/store/profileStore';
import { setProfileLocked } from '@/features/profile/lib/profileApi';
import { useSound } from '@/features/settings/store/soundStore';

export default function Settings() {
  const router = useRouter();
  const t = useT();
  const friendCount = useCircle((s) => s.friends.length);
  const myName = useProfile((s) => s.name);
  const locked = useProfile((s) => s.locked);
  const soundOn = useSound((s) => s.on);
  const setSound = useSound((s) => s.set);
  const setLocked = useProfile((s) => s.setLocked);

  // Đổi ngay trên màn, server hỏng thì trả lại như cũ.
  const changeLock = useCallback(
    async (next: boolean) => {
      setLocked(next);
      const res = await setProfileLocked(next);
      if (!res.ok) setLocked(!next);
    },
    [setLocked],
  );
  const current = useTheme((s) => s.palette.key);
  const fixed = useTheme((s) => s.fixed);
  const mode = useTheme((s) => s.mode);
  const setPalette = useTheme((s) => s.setPalette);
  const setMode = useTheme((s) => s.setMode);
  const sky = (SKY_KEYS as readonly string[]).includes(current) ? (current as SkyKey) : null;

  // Tên bảng màu nằm ở kho chữ chứ không ở bảng màu: "Đất nung" là chữ hiện cho
  // người dùng, mà chữ thì phải dịch được.
  const names = useMemo(
    () =>
      Object.fromEntries(PALETTE_KEYS.map((k) => [k, t(`theme.${k}`)])) as Record<
        PaletteKey,
        string
      >,
    [t],
  );
  const skyNames = useMemo(
    () => Object.fromEntries(SKY_KEYS.map((k) => [k, t(`theme.${k}`)])) as Record<SkyKey, string>,
    [t],
  );

  return (
    <SettingsScreen
      name={myName ?? ME.name}
      friendCount={friendCount}
      palette={fixed}
      paletteNames={names}
      onPickPalette={setPalette}
      mode={mode}
      sky={sky}
      skyNames={skyNames}
      onPickMode={setMode}
      locked={locked}
      onLockChange={(v) => void changeLock(v)}
      soundOn={soundOn}
      onSoundChange={setSound}
      onClose={() => router.back()}
    />
  );
}
