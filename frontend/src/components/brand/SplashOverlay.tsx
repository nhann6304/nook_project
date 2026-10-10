/**
 * Splash ĐỘNG — nối tiếp splash gốc (ảnh tĩnh `app.json` → `expo-splash-screen`).
 *
 * Splash gốc là ẢNH do hệ điều hành vẽ trước khi JS chạy, nên không động được.
 * Lớp này vẽ đè ĐÚNG ảnh đó (nền navy, logo 180pt giữa màn — khớp `imageWidth`)
 * rồi mới thả splash gốc, nên mắt người không thấy chỗ nối. Sau đó: mặt cười
 * nháy mắt một cái, logo phồng nhẹ rồi phóng to tan vào app (kiểu Twitter).
 *
 * Tổng ~1.3 giây, chỉ ở lần mở nguội. Chỉ transform + opacity.
 */
import { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { brand, ease } from '@design';
import { Wordmark } from './Wordmark';

/** Logo trong ảnh splash: khung 400, logo rộng 360 → hiện 180 ⇒ rộng 162, cao 70. */
const LOGO_H = Math.round((130 * 1.2 * 180) / 400);
const WINK_AT = 260;
const LEAVE_AT = 900;
const IN_OUT = Easing.bezier(...ease.inOut);

export function SplashOverlay({
  onShown,
  onDone,
}: {
  /** Lớp này đã lên màn — giờ mới thả splash gốc. */
  onShown: () => void;
  onDone: () => void;
}) {
  const scale = useSharedValue(1);
  const fade = useSharedValue(1);

  useEffect(() => {
    scale.set(
      withSequence(
        withDelay(WINK_AT, withTiming(1.06, { duration: 260, easing: IN_OUT })),
        withDelay(LEAVE_AT - WINK_AT - 260, withTiming(0.94, { duration: 160, easing: IN_OUT })),
        withTiming(6, { duration: 420, easing: Easing.in(Easing.cubic) }),
      ),
    );
    fade.set(
      withDelay(
        LEAVE_AT + 200,
        withTiming(0, { duration: 340 }, (done) => {
          if (done) runOnJS(onDone)();
        }),
      ),
    );
  }, [fade, onDone, scale]);

  const shown = useCallback(() => onShown(), [onShown]);
  const root = useAnimatedStyle(() => ({ opacity: fade.value }));
  const logo = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.root, root]} pointerEvents="none" onLayout={shown}>
      <Animated.View style={logo}>
        <Wordmark size={LOGO_H} brandTone blink="wink" blinkDelay={WINK_AT} />
      </Animated.View>
    </Animated.View>
  );
}

/** Không theo bảng màu: splash gốc cũng không biết bảng màu nào. */
const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    backgroundColor: brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
