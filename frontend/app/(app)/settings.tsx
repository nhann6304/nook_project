import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { PALETTE_KEYS, useTheme, type PaletteKey } from '@design';
import { useT } from '@i18n';
import { FRIENDS } from '@/mocks/friends';
import { ME } from '@/mocks/moments';

export default function Settings() {
  const router = useRouter();
  const t = useT();
  const palette = useTheme((s) => s.palette.key);
  const setPalette = useTheme((s) => s.setPalette);

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

  return (
    <SettingsScreen
      name={ME.name}
      friendCount={FRIENDS.length}
      palette={palette}
      paletteNames={names}
      onPickPalette={setPalette}
      onClose={() => router.back()}
    />
  );
}
