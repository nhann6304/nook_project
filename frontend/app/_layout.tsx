/**
 * Gốc của app. Thứ tự các lớp bọc ở đây không đảo được.
 *
 * GestureHandlerRootView phải nằm NGOÀI CÙNG, nếu không mọi cử chỉ vuốt đều
 * câm trên Android — và câm không báo lỗi, chỉ là không có gì xảy ra.
 *
 * Splash được giữ lại cho tới khi bộ chữ nạp xong. Thả sớm thì người dùng thấy
 * một nhịp chữ Roboto rồi mới nhảy sang Be Vietnam Pro — cả màn giật một cái.
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
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import { color } from '@design';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, error] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    Fredoka_600SemiBold,
  });

  useEffect(() => {
    // Thả splash cả khi nạp chữ HỎNG. Không có nhánh này thì một lỗi font
    // biến thành màn hình splash đứng vĩnh viễn — lỗi tệ nhất có thể có.
    if (ready || error) void SplashScreen.hideAsync();
  }, [ready, error]);

  if (!ready && !error) return null;

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
