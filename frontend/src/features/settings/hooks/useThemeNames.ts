import { useMemo } from 'react';
import { ACCENT_KEYS, SKY_SCENES, type AccentKey, type SkyScene } from '@design';
import { useT } from '@i18n';

/**
 * Tên màu locket và tên cảnh trời, đã dịch. Nằm ở kho chữ chứ không ở bảng
 * màu: "Oải hương" là chữ hiện cho người dùng, phải dịch được.
 */
export function useThemeNames() {
  const t = useT();
  return useMemo(
    () => ({
      accent: Object.fromEntries(ACCENT_KEYS.map((k) => [k, t(`theme.${k}`)])) as Record<
        AccentKey,
        string
      >,
      scene: Object.fromEntries(SKY_SCENES.map((k) => [k, t(`theme.${k}`)])) as Record<
        SkyScene,
        string
      >,
    }),
    [t],
  );
}
