/**
 * Đếm ngược giây. Dùng cho nút "Gửi lại mã".
 *
 * Mốc thời gian giữ trong ref chứ không tính bằng cách trừ dần một biến state:
 * trừ dần thì app bị chuyển ra nền 20 giây rồi quay lại sẽ đếm sai 20 giây đó.
 * Ở đây mỗi nhịp đều tính lại từ mốc thật, nên ra nền vào lại vẫn đúng.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCountdown(seconds: number) {
  const until = useRef(0);
  const [left, setLeft] = useState(0);

  const start = useCallback(() => {
    until.current = Date.now() + seconds * 1000;
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => {
      const remain = Math.max(0, Math.ceil((until.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain === 0) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [left]);

  return { left, running: left > 0, start };
}
