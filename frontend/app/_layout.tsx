/**
 * Gốc của app. Thứ tự các lớp bọc ở đây không đảo được.
 *
 * GestureHandlerRootView phải nằm NGOÀI CÙNG, nếu không mọi cử chỉ vuốt đều
 * câm trên Android — và câm không báo lỗi, chỉ là không có gì xảy ra.
 *
 * Splash được giữ tới khi NĂM thứ xong: bộ chữ, ngôn ngữ, bảng màu đã chọn,
 * phiên đăng nhập cất trên máy, và cờ "đã xem giới thiệu". Thả sớm vì chữ thì thấy một nhịp Roboto rồi nhảy sang Nunito;
 * thả sớm vì ngôn ngữ thì thấy màn đầu sai tiếng; thả sớm vì bảng màu thì cả
 * app nháy một cái đổi màu. Mỗi cái chỉ khoảng 30ms, nhưng là 30ms đầu tiên
 * người dùng nhìn thấy. Xong thì `<SplashOverlay>` nối tiếp: logo nháy mắt rồi
 * phóng to tan vào app.
 *
 * Ba nút điều hướng của Android theo userInterfaceStyle 'automatic' trong app.json. (expo-navigation-bar SDK 57 đã bỏ
 * setButtonStyleAsync — đừng gọi lại hàm đó.)
 */
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { SplashOverlay } from '@ui';
import { useColors, useStyles, useThemeReady, type Palette } from '@design';
import { useI18nReady } from '@i18n';
import { initSound } from '@/lib/device/sound';
import { useSound } from '@/features/settings/store/soundStore';
import { useAuth } from '@/features/auth/store/authStore';
import { useRainWatch } from '@/features/sky/hooks/useRainWatch';
import { useAudience } from '@/features/camera/store/audienceStore';
import { useOnboarding } from '@/features/onboarding/store/onboardingStore';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const s = useStyles(make);
  const light = useColors().light;
  const localeReady = useI18nReady();
  const themeReady = useThemeReady();
  const [fontsReady, error] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Caveat_700Bold,
  });

  useRainWatch();
  const authReady = useAuth((s) => s.phase !== 'unknown');
  const introReady = useOnboarding((s) => s.ready);
  const ready =
    (fontsReady || error !== null) && localeReady && themeReady && authReady && introReady;
  // Splash động chạy một lần mỗi lần mở nguội, đè lên app đã dựng sẵn bên dưới.
  const [splash, setSplash] = useState(true);
  const splashDone = useCallback(() => setSplash(false), []);
  const splashShown = useCallback(() => void SplashScreen.hideAsync(), []);

  useEffect(() => {
    void useAuth.getState().hydrate();
    void useOnboarding.getState().hydrate();
    void useAudience.getState().hydrate();
  }, []);

  // Âm thanh nạp song song, KHÔNG giữ splash: thiếu tiếng vài trăm mili giây
  // đầu không ai nhận ra, chờ nó thì ai cũng thấy.
  useEffect(() => {
    void initSound().then(useSound.getState().hydrate);
  }, []);

  // Thả splash cả khi nạp chữ HỎNG — `ready` không chờ font thành công. Không
  // có nhánh đó thì một lỗi font biến thành splash đứng vĩnh viễn. Splash gốc
  // được thả khi lớp splash động đã lên màn (`splashShown`), không sớm hơn.

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={s.root}>
      <SafeAreaProvider>
        <StatusBar style={light ? 'dark' : 'light'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: s.page,
            // Chuyển màn trượt ngang trên cả hai hệ. Mặc định của Android là
            // trồi từ dưới lên, lệch hẳn nhịp so với iOS.
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          {/* Vào app sau khi đăng nhập: mờ dần, không trượt — không có "màn
              trước" nào để quay lại. */}
          <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
        </Stack>
        {splash ? <SplashOverlay onShown={splashShown} onDone={splashDone} /> : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    page: { backgroundColor: c.bg },
  });
