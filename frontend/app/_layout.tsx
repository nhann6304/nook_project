/**
 * Gốc của app. Thứ tự các lớp bọc ở đây không đảo được.
 *
 * GestureHandlerRootView phải nằm NGOÀI CÙNG, nếu không mọi cử chỉ vuốt đều
 * câm trên Android — và câm không báo lỗi, chỉ là không có gì xảy ra.
 *
 * Splash được giữ tới khi BỐN thứ xong: bộ chữ, ngôn ngữ, bảng màu đã chọn, và
 * phiên đăng nhập cất trên máy. Thả sớm vì chữ thì thấy một nhịp Roboto rồi nhảy sang Poppins;
 * thả sớm vì ngôn ngữ thì thấy màn đầu sai tiếng; thả sớm vì bảng màu thì cả
 * app nháy một cái đổi màu. Mỗi cái chỉ khoảng 30ms, nhưng là 30ms đầu tiên
 * người dùng nhìn thấy.
 *
 * Ba nút điều hướng của Android theo userInterfaceStyle 'automatic' trong app.json. (expo-navigation-bar SDK 57 đã bỏ
 * setButtonStyleAsync — đừng gọi lại hàm đó.)
 */
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { useColors, useStyles, useThemeReady, type Palette } from '@design';
import { useI18nReady } from '@i18n';
import { initSound } from '@/lib/sound';
import { useSound } from '@/features/settings/store/soundStore';
import { useAuth } from '@/features/auth/store/authStore';
import { useRainWatch } from '@/features/sky/lib/useRainWatch';
import { useAudience } from '@/features/camera/store/audienceStore';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const s = useStyles(make);
  const light = useColors().light;
  const localeReady = useI18nReady();
  const themeReady = useThemeReady();
  const [fontsReady, error] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Caveat_700Bold,
  });

  useRainWatch();
  const authReady = useAuth((s) => s.phase !== 'unknown');
  const ready = (fontsReady || error !== null) && localeReady && themeReady && authReady;

  useEffect(() => {
    void useAuth.getState().hydrate();
    void useAudience.getState().hydrate();
  }, []);

  // Âm thanh nạp song song, KHÔNG giữ splash: thiếu tiếng vài trăm mili giây
  // đầu không ai nhận ra, chờ nó thì ai cũng thấy.
  useEffect(() => {
    void initSound().then(useSound.getState().hydrate);
  }, []);

  useEffect(() => {
    // Thả splash cả khi nạp chữ HỎNG. Không có nhánh này thì một lỗi font
    // biến thành màn hình splash đứng vĩnh viễn — lỗi tệ nhất có thể có.
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    page: { backgroundColor: c.bg },
  });
