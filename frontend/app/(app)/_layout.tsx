import { Stack } from 'expo-router';

/**
 * Gốc của app sau đăng nhập: `(tabs)` là ba nút dưới đáy (Trang chủ · Lướt ảnh
 * · Cài đặt). Mọi màn khác CHỒNG lên, hướng trượt nói nó nằm ở đâu: bạn bè bên
 * TRÁI (nút góc trái màn chính), tin nhắn bên PHẢI (nút góc phải).
 */
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="friend/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="person/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="nearby" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="prefs/appearance" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="prefs/privacy" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="prefs/language" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="journal" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
