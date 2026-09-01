/**
 * Gốc của app. Thứ tự các lớp bọc ở đây không đảo được.
 *
 * GestureHandlerRootView phải nằm NGOÀI CÙNG, nếu không mọi cử chỉ vuốt đều
 * câm trên Android — và câm không báo lỗi, chỉ là không có gì xảy ra.
 *
 * Splash được giữ lại cho tới khi CẢ HAI thứ xong: bộ chữ và ngôn ngữ đã chọn.
 * Thả sớm vì chữ thì người dùng thấy một nhịp Roboto rồi mới nhảy sang Be
 * Vietnam Pro; thả sớm vì ngôn ngữ thì họ thấy màn đầu bằng tiếng Việt rồi đổi
 * sang tiếng Anh. Cả hai đều chỉ khoảng 30ms, nhưng là 30ms đầu tiên họ nhìn.
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
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
} from '@expo-google-fonts/be-vietnam-pro';
import { color } from '@design';
import { useI18nReady } from '@i18n';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const localeReady = useI18nReady();
  const [fontsReady, error] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
  });

  const ready = (fontsReady || error !== null) && localeReady;

  useEffect(() => {
    // Thả splash cả khi nạp chữ HỎNG. Không có nhánh này thì một lỗi font
    // biến thành màn hình splash đứng vĩnh viễn — lỗi tệ nhất có thể có.
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={s.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
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
          <Stack.Screen name="(app)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  page: { backgroundColor: color.bg },
});
