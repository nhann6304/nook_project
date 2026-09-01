/**
 * Người dùng bật "Giảm chuyển động" trong Cài đặt máy thì mọi hiệu ứng nền
 * phải tắt. Đây không phải tuỳ chọn lịch sự — với một số người, hiệu ứng phồng
 * xẹp chạy vòng lặp gây chóng mặt thật.
 *
 * Hook lắng nghe cả thay đổi lúc đang chạy: người ta bật cài đặt rồi quay lại
 * app là hiệu ứng tắt ngay, không phải mở lại app.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (alive) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
