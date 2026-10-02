import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { PALETTE_KEYS, SKY_KEYS, useTheme, type PaletteKey, type SkyKey } from '@design';
import { useT } from '@i18n';
import { useCircle } from '@/features/circle/store/circleStore';
import { ME } from '@/mocks/moments';
import { useProfile } from '@/features/profile/store/profileStore';

export default function Settings() {
  const router = useRouter();
  const t = useT();
  const friendCount = useCircle((s) => s.friends.length);
  const myName = useProfile((s) => s.name);
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
      onClose={() => router.back()}
    />
  );
}
