import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { startChatRealtime } from '@/features/chat/api/chatApi';
import { TourOverlay } from '@/features/onboarding/components/tour/TourOverlay';

/**
 * Gốc của app sau đăng nhập: `(tabs)` là ba nút dưới đáy (Ký ức · Chụp ·
 * Tin nhắn). Bạn bè (`circle`) mở từ viên trên cùng màn Chụp. Mọi màn khác CHỒNG lên: trang chi tiết trượt từ phải, màn "mở
 * ra" (nhật ký, Pro) trượt từ dưới. Trang cá nhân + cài đặt là `me`.
 */
export default function AppLayout() {
  // Ống chat mở suốt lúc đã đăng nhập (chỉ khi có server) — tin tới tức thì.
  useEffect(() => startChatRealtime(), []);
  return (
    <View style={styles.fill}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="friend/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="person/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="me" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="circle" options={{ animation: 'slide_from_left' }} />
        <Stack.Screen name="qr" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="nearby" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="prefs/appearance" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="prefs/privacy" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="prefs/language" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="pro" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
      {/* Tour chỉ nút phủ lên mọi thứ, kể cả thanh tab. */}
      <TourOverlay />
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
