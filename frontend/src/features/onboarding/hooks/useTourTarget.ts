/**
 * Đánh dấu một nút cho tour chỉ: `const ref = useTourTarget('shutter')` rồi gắn
 * vào `<View ref collapsable={false}>` bọc nút. Tour ĐO lúc tới bước đó
 * (`measureInWindow`) chứ không nhớ toạ độ từ lúc dựng — trang lướt, bàn phím,
 * thanh tab nổi đều làm toạ độ cũ sai.
 *
 * Sổ là một Map ở tầng module, không phải state: đăng ký không cần vẽ lại ai.
 */
import { useEffect, useRef, type RefObject } from 'react';
import type { View } from 'react-native';
import type { TourTargetId } from '../utils/tourSteps';

export type TourRect = { x: number; y: number; w: number; h: number };

const targets = new Map<TourTargetId, RefObject<View | null>>();

export function useTourTarget(id: TourTargetId): RefObject<View | null> {
  const ref = useRef<View>(null);
  useEffect(() => {
    targets.set(id, ref);
    return () => {
      if (targets.get(id) === ref) targets.delete(id);
    };
  }, [id]);
  return ref;
}

/** Đo mà không có hồi âm sau chừng này thì coi như nút vắng mặt. */
const MEASURE_TIMEOUT_MS = 300;

/** Toạ độ trên màn của nút; `null` khi nút không có mặt, rộng 0 hoặc nằm ngoài màn. */
export function measureTourTarget(
  id: TourTargetId,
  screen: { width: number; height: number },
): Promise<TourRect | null> {
  const view = targets.get(id)?.current;
  if (!view) return Promise.resolve(null);
  return new Promise((resolve) => {
    // View vừa gỡ khỏi cây thì `measureInWindow` có thể không bao giờ gọi lại.
    const timer = setTimeout(() => resolve(null), MEASURE_TIMEOUT_MS);
    view.measureInWindow((x, y, w, h) => {
      clearTimeout(timer);
      // Nút ở trang bên cạnh (đang lướt ngang) đo ra toạ độ ngoài màn — bỏ.
      const onScreen = x + w > 0 && y + h > 0 && x < screen.width && y < screen.height;
      resolve(w > 0 && h > 0 && onScreen ? { x, y, w, h } : null);
    });
  });
}

/** Mã các nút đang đăng ký — để in log khi tour không tìm ra nút nào. */
export function registeredTourTargets(): readonly TourTargetId[] {
  return [...targets.keys()];
}
