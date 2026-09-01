import { Stack } from 'expo-router';

/**
 * Trong app có hai tầng điều hướng, và ranh giới giữa chúng là một quyết định
 * chứ không phải chuyện kỹ thuật:
 *
 *   TAB — ba chỗ người ta ĐI ĐI LẠI LẠI cả ngày: Khoảnh khắc · Camera · Trò
 *   chuyện. Chuyển giữa chúng không được đẻ ra lịch sử, vì không ai "quay lại"
 *   khỏi màn camera.
 *
 *   ĐẨY CHỒNG — chỗ người ta vào rồi ra: Góc, Cài đặt, một cuộc trò chuyện cụ
 *   thể. Những màn này CÓ nút quay lại và có ý nghĩa "ở trên" màn trước.
 *
 * Camera nằm trong tab nên nó không bị tháo khi chuyển sang Khoảnh khắc — quay
 * lại chụp là tức thì, không phải chờ camera khởi động lại.
 */
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="circle" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="chat/[id]" />
    </Stack>
  );
}
