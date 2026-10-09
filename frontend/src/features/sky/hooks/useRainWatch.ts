/**
 * Theo dõi mưa cho chế độ "Theo trời". Gọi MỘT lần ở `app/_layout.tsx`.
 *
 * Không bao giờ tự xin quyền vị trí — chỉ dùng khi người dùng đã cho (ở "Tìm
 * quanh đây" hoặc nút trong Cài đặt). Chưa cho thì màu chỉ đổi theo giờ.
 * Hỏi lại mỗi 30 phút và mỗi lần app quay về từ nền; ngoài "Theo trời" thì nghỉ.
 */
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '@design';
import { isRaining } from '../api/weatherApi';

const EVERY_MS = 30 * 60_000;
/** Vị trí cũ hơn chừng này thì xin lại (mức thô, nhanh, đỡ pin). */
const MAX_AGE_MS = 60 * 60_000;

export async function checkRainNow(): Promise<void> {
  const perm = await Location.getForegroundPermissionsAsync();
  if (!perm.granted) return;
  const pos =
    (await Location.getLastKnownPositionAsync({ maxAge: MAX_AGE_MS })) ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest }));
  const raining = await isRaining(pos.coords.latitude, pos.coords.longitude);
  if (raining !== null) useTheme.getState().setRaining(raining);
}

export function useRainWatch(): void {
  const sky = useTheme((s) => s.mode === 'sky');
  const check = useCallback(() => {
    void checkRainNow().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!sky) return;
    check();
    const timer = setInterval(check, EVERY_MS);
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') check();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [check, sky]);
}
