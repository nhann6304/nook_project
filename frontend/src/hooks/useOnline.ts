/**
 * Máy có đang ra được internet không — để hiện thanh "Đang chờ mạng".
 *
 * Đây là GỢI Ý, không phải trọng tài (`.docs/04-offline-design.md` mục 7):
 * Wi-Fi quán cà phê chưa đăng nhập vẫn báo "có mạng". Đừng dùng nó để quyết
 * định có gọi server hay không — cứ gọi, hỏng thì xử.
 *
 * Chờ 1,5 giây mới báo mất mạng: đổi Wi-Fi sang 4G cũng rớt một nhịp, báo ngay
 * là thanh nháy lên rồi tắt, người dùng tưởng app hỏng.
 */
import { useEffect, useState } from 'react';
import { useNetworkState } from 'expo-network';

const GRACE_MS = 1500;

export function useOnline(): boolean {
  const state = useNetworkState();
  const down = state.isConnected === false || state.isInternetReachable === false;
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!down) {
      const back = setTimeout(() => setOnline(true), 0);
      return () => clearTimeout(back);
    }
    const timer = setTimeout(() => setOnline(false), GRACE_MS);
    return () => clearTimeout(timer);
  }, [down]);

  return online;
}
