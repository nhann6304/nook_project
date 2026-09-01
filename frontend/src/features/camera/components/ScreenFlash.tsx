/**
 * Đèn màn hình — lớp trắng loé lên trước khi chụp bằng camera TRƯỚC.
 *
 * Máy nào cũng chỉ có đèn thật ở mặt sau. Bật `flash` của expo-camera khi đang
 * dùng camera trước thì hệ thống nhận lệnh nhưng KHÔNG có gì sáng lên — đúng
 * kiểu công tắc bấm không ăn mà cả dự án này đang tránh.
 *
 * Cách mọi app selfie làm, kể cả Locket: nhuộm trắng cả màn hình trong chốc
 * lát, lấy chính màn hình làm đèn. Nó thật sự sáng lên được vì màn OLED ở mức
 * sáng cao đủ soi một khuôn mặt cách 40cm.
 *
 * Chạy bằng Reanimated trên luồng UI: đúng lúc này luồng JS đang bận nhất cả
 * app (mã hoá ảnh), nếu nhuộm bằng JS thì cái loé sẽ giật hoặc trễ mất khoảnh
 * khắc cần soi.
 */
import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { duration } from '@design';

/** Màn hình phải kịp sáng lên trước khi cảm biến đọc khung. */
export const WARMUP_MS = 140;

export type ScreenFlashHandle = {
  /** Bật sáng. Chờ WARMUP_MS rồi mới chụp. */
  on: () => void;
  off: () => void;
};

export const ScreenFlash = forwardRef<ScreenFlashHandle>(function ScreenFlash(_props, ref) {
  const v = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    on: () => {
      v.value = withTiming(1, { duration: duration.instant });
    },
    off: () => {
      v.value = withTiming(0, { duration: duration.base });
    },
  }));

  const anim = useAnimatedStyle(() => ({ opacity: v.value }));

  return <Animated.View pointerEvents="none" style={[s.sheet, anim]} />;
});

const s = StyleSheet.create({
  // Không lấy từ token: đây không phải "một màu của thương hiệu", nó là ÁNH
  // SÁNG. Phải là trắng cao nhất máy vẽ được, thấp hơn là mất tác dụng soi.
  sheet: { ...StyleSheet.absoluteFillObject, backgroundColor: 'white' },
});
