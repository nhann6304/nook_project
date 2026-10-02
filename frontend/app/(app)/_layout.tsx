import { Stack } from 'expo-router';

/**
 * Không thanh tab (bảng thiết kế bản 7). Màn chính là camera + ảnh bạn bè lướt
 * dọc; mọi màn khác là màn CHỒNG lên nó, và hướng trượt nói nó nằm ở đâu:
 * bạn bè ở bên TRÁI (nút góc trái), tin nhắn ở bên PHẢI (nút góc phải).
 */
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ animation: 'fade' }} />
      <Stack.Screen name="circle" options={{ animation: 'slide_from_left' }} />
      <Stack.Screen name="chats" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="friend/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="person/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="journal" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
