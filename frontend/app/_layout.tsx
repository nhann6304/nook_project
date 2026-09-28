/**
 * Gốc của app. Thứ tự các lớp bọc ở đây không đảo được.
 *
 * GestureHandlerRootView phải nằm NGOÀI CÙNG, nếu không mọi cử chỉ vuốt đều
 * câm trên Android — và câm không báo lỗi, chỉ là không có gì xảy ra.
 *
 * Splash được giữ tới khi BA thứ xong: bộ chữ, ngôn ngữ đã chọn, bảng màu đã
 * chọn. Thả sớm vì chữ thì thấy một nhịp Roboto rồi nhảy sang Plus Jakarta Sans;
 * thả sớm vì ngôn ngữ thì thấy màn đầu sai tiếng; thả sớm vì bảng màu thì cả
 * app nháy một cái đổi màu. Mỗi cái chỉ khoảng 30ms, nhưng là 30ms đầu tiên
 * người dùng nhìn thấy.
 *
 * Ba nút điều hướng của Android không cần nhuộm tay: userInterfaceStyle 'dark'
 * trong app.json đã cho chúng màu sáng. (expo-navigation-bar SDK 57 đã bỏ
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
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useColors, useStyles, useThemeReady, type Palette } from '@design';
import { useI18nReady } from '@i18n';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const s = useStyles(make);
  const light = useColors().light;
  const localeReady = useI18nReady();
  const themeReady = useThemeReady();
  const [fontsReady, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const ready = (fontsReady || error !== null) && localeReady && themeReady;

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
