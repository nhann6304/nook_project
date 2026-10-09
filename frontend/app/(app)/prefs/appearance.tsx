import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useTheme, type AccentKey, type ThemeMode } from '@design';
import { AppearanceScreen } from '@/features/settings/screens/appearance/AppearanceScreen';
import { saveSettings } from '@/features/settings/api/settingsApi';
import { useThemeNames } from '@/features/settings/hooks/useThemeNames';
import { checkRainNow } from '@/features/sky/hooks/useRainWatch';

export default function Appearance() {
  const router = useRouter();
  const names = useThemeNames();
  const mode = useTheme((s) => s.mode);
  const accent = useTheme((s) => s.accent);

  // Quyền vị trí đọc lại mỗi lần vào trang — có thể vừa cho ở "Tìm quanh đây".
  const [rainReady, setRainReady] = useState(false);
  useEffect(() => {
    void Location.getForegroundPermissionsAsync().then((p) => setRainReady(p.granted));
  }, []);
  const enableRain = useCallback(async () => {
    const p = await Location.requestForegroundPermissionsAsync();
    setRainReady(p.granted);
    if (p.granted) await checkRainNow().catch(() => undefined);
  }, []);

  // Áp dụng trên máy TRƯỚC (luôn thành công), rồi gửi server một lần.
  const save = useCallback(async (m: ThemeMode, a: AccentKey) => {
    const theme = useTheme.getState();
    theme.setMode(m);
    theme.setAccent(a);
    const res = await saveSettings({ themeMode: m, accent: a });
    return res.ok ? null : res.message;
  }, []);

  return (
    <AppearanceScreen
      mode={mode}
      accent={accent}
      accentNames={names.accent}
      sceneNames={names.scene}
      rainReady={rainReady}
      onEnableRain={() => void enableRain()}
      onSave={save}
      onBack={() => router.back()}
    />
  );
}
