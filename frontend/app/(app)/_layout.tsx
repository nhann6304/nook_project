import { Stack } from 'expo-router';

/**
 * Trong app KHÔNG có thanh tab. Điều hướng bằng cử chỉ: chạm dấu hiệu để vào
 * Góc, vuốt lên để xem Khoảnh khắc, bánh răng để vào Cài đặt.
 *
 * Vì vậy Khoảnh khắc trồi từ DƯỚI lên — khớp với cử chỉ vuốt lên đã mở nó.
 */
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="camera" />
      <Stack.Screen name="feed" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="circle" />
    </Stack>
  );
}
