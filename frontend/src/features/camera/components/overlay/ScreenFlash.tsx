/**
 * Đèn màn hình — lớp trắng loé lên trước khi chụp bằng camera TRƯỚC.
 *
 * Máy nào cũng chỉ có đèn thật ở mặt sau. Bật `flash` của expo-camera khi đang
 * dùng camera trước thì hệ thống nhận lệnh nhưng KHÔNG có gì sáng lên — đúng
 * kiểu công tắc bấm không ăn mà cả dự án này đang tránh.
 *
 * Lấy chính màn hình làm đèn: nhuộm trắng trong chốc lát. Từ 07/10/2026 chỉ
 * nhuộm TRONG KHUNG camera, không cả màn hình — cả màn trắng xoá thì chói và
 * người dùng thấy app "khựng" một nhịp. Khung chiếm gần hết bề ngang nên vẫn
 * đủ soi mặt ở khoảng cách cầm máy.
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
      v.set(withTiming(1, { duration: duration.instant }));
    },
    off: () => {
      v.set(withTiming(0, { duration: duration.base }));
    },
  }));

  const anim = useAnimatedStyle(() => ({ opacity: v.value }));

  return <Animated.View pointerEvents="none" style={[s.sheet, anim]} />;
});

const s = StyleSheet.create({
  // Không lấy từ token: đây là ÁNH SÁNG, không phải màu thương hiệu. Phủ kín
  // cha của nó — đặt trong khung camera, không phải cả màn hình.
  sheet: { ...StyleSheet.absoluteFill, backgroundColor: 'white' },
});
