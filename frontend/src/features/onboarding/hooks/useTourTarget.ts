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

/** Toạ độ trên màn của nút; `null` khi nút không có mặt hoặc rộng 0. */
export function measureTourTarget(id: TourTargetId): Promise<TourRect | null> {
  const view = targets.get(id)?.current;
  if (!view) return Promise.resolve(null);
  return new Promise((resolve) => {
    view.measureInWindow((x, y, w, h) => resolve(w > 0 && h > 0 ? { x, y, w, h } : null));
  });
}
