/**
 * Bộ chuyển động dùng chung — gọi theo VIỆC, như `haptics.ts` gọi rung.
 *
 *   <Animated.View entering={motion.appear()} />            hiện ra tại chỗ
 *   <Animated.View entering={motion.rise(i)} />             hiện ra trong danh sách, so le
 *   <Animated.View exiting={motion.leave()} />              rời đi
 *   <Animated.View layout={motion.reflow()} />              ô khác dồn chỗ khi có ô thêm/bớt
 *
 * Hàm, không phải hằng: builder của Reanimated đổi chính nó khi gọi `.delay()`,
 * dùng chung một thể là ô này đặt độ trễ cho cả danh sách.
 *
 * Không có lò xo nảy ở đây (02/10/2026: mọi thứ "tưng tưng"). Cần lò xo cho
 * phản hồi nhấn thì `spring.press`, đã tắt dần tới hạn.
 * Reanimated tự tắt mấy hiệu ứng này khi máy bật "Giảm chuyển động".
 */
import { Easing, FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { duration, ease } from './tokens';

/** Khoảng so le giữa hai ô liền nhau. Quá 60ms là danh sách dài thấy chậm. */
const STAGGER = 45;
/** Ô thứ mấy trở đi thì thôi so le — ô thứ 12 không đáng chờ nửa giây. */
const STAGGER_CAP = 8;
const OUT = Easing.bezier(...ease.out);

export const motion = {
  appear: () => FadeIn.duration(duration.base),
  rise: (index = 0) =>
    FadeInDown.delay(Math.min(index, STAGGER_CAP) * STAGGER)
      .duration(duration.base)
      .easing(OUT),
  leave: () => FadeOut.duration(duration.fast),
  reflow: () => LinearTransition.duration(duration.base).easing(OUT),
};
