/**
 * Trạng thái "Tìm quanh đây": xin quyền vị trí, đếm ngược tự tắt, hỏi lại
 * mỗi 15 giây trong lúc bật, và rời đi khi người dùng tắt hoặc thoát màn.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import {
  ACTIVE_SECONDS,
  announce,
  coarse,
  leave,
  type NearbyPerson,
  type Radius,
} from './nearbyApi';

export type NearbyStatus = 'idle' | 'locating' | 'active' | 'denied' | 'failed';

const REFRESH_MS = 15_000;

export function useNearby() {
  const [status, setStatus] = useState<NearbyStatus>('idle');
  const [radius, setRadiusState] = useState<Radius>(200);
  const [people, setPeople] = useState<readonly NearbyPerson[]>([]);
  const [left, setLeft] = useState(ACTIVE_SECONDS);
  const spot = useRef<{ latitude: number; longitude: number } | null>(null);
  /** Chỗ của MÌNH (đã làm tròn) — chỉ để vẽ bản đồ nền trên máy, không gửi ai. */
  const [center, setCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const endsAt = useRef(0);

  const ask = useCallback(async (r: Radius) => {
    if (!spot.current) return;
    const res = await announce(spot.current, r);
    if (res.ok) setPeople(res.people);
  }, []);

  const stop = useCallback(() => {
    setStatus('idle');
    setPeople([]);
    spot.current = null;
    setCenter(null);
    void leave();
  }, []);

  const start = useCallback(async () => {
    setStatus('locating');
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) {
      setStatus('denied');
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      spot.current = {
        latitude: coarse(pos.coords.latitude),
        longitude: coarse(pos.coords.longitude),
      };
      setCenter(spot.current);
    } catch {
      setStatus('failed');
      return;
    }
    endsAt.current = Date.now() + ACTIVE_SECONDS * 1000;
    setLeft(ACTIVE_SECONDS);
    setStatus('active');
    await ask(radius);
  }, [ask, radius]);

  const setRadius = useCallback(
    (r: Radius) => {
      setRadiusState(r);
      if (spot.current) void ask(r);
    },
    [ask],
  );

  // Đang bật: đếm ngược mỗi giây, hỏi lại mỗi 15 giây, hết giờ thì tự tắt.
  useEffect(() => {
    if (status !== 'active') return;
    const tick = setInterval(() => {
      const s = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) stop();
    }, 1000);
    const refresh = setInterval(() => void ask(radius), REFRESH_MS);
    return () => {
      clearInterval(tick);
      clearInterval(refresh);
    };
  }, [ask, radius, status, stop]);

  // Rời màn là thôi hiện mình, kể cả khi chưa hết giờ.
  useEffect(() => () => void leave(), []);

  return { status, radius, setRadius, people, left, center, start, stop };
}
