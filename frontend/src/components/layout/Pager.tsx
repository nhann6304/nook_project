/**
 * Pager — lướt dọc từng trang một, kiểu Locket: camera là trang 0, mỗi khoảnh
 * khắc là một trang bên dưới.
 *
 * Trang đang rời đi lún xuống SAU trang mới (thu nhỏ + tối dần + trôi chậm hơn
 * ngón tay), nên lướt có cảm giác xếp chồng từng tấm chứ không phải cuộn một
 * dải dài. Mọi thứ chạy trên luồng UI qua `scrollY`.
 *
 * Dùng `snapToInterval` chứ không `pagingEnabled`: Android không hỗ trợ
 * `pagingEnabled` theo chiều dọc.
 *
 * Chỉ vẽ trang trong tầm ±2 của trang đang xem, cộng các trang trong `keep`
 * (camera phải sống mãi, tháo ra là mở lại mất nửa giây).
 */
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  scrollTo,
  runOnUI,
  type SharedValue,
} from 'react-native-reanimated';

export type PagerHandle = { goTo: (index: number, animated?: boolean) => void };

export type PagerProps = {
  count: number;
  pageHeight: number;
  renderPage: (index: number) => React.ReactNode;
  /** Vị trí cuộn, chia sẻ cho những thứ ngoài pager muốn chuyển động theo. */
  scrollY: SharedValue<number>;
  onIndexChange?: (index: number) => void;
  scrollEnabled?: boolean;
  keep?: readonly number[];
};

const WINDOW = 2;

export const Pager = forwardRef<PagerHandle, PagerProps>(function Pager(
  { count, pageHeight, renderPage, scrollY, onIndexChange, scrollEnabled = true, keep },
  ref,
) {
  const scroller = useAnimatedRef<Animated.ScrollView>();
  const [index, setIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  const settle = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageHeight <= 0) return;
      const i = Math.round(e.nativeEvent.contentOffset.y / pageHeight);
      setIndex(i);
      onIndexChange?.(i);
    },
    [onIndexChange, pageHeight],
  );

  useImperativeHandle(
    ref,
    () => ({
      goTo: (i, animated = true) => {
        const y = i * pageHeight;
        runOnUI(() => {
          'worklet';
          scrollTo(scroller, 0, y, animated);
        })();
        // Không animated thì không có sự kiện dừng cuộn nào để bắt.
        if (!animated) {
          setIndex(i);
          onIndexChange?.(i);
        }
      },
    }),
    [onIndexChange, pageHeight, scroller],
  );

  const pages = [];
  for (let i = 0; i < count; i++) {
    const live = Math.abs(i - index) <= WINDOW || keep?.includes(i) === true;
    pages.push(
      <Page key={i} index={i} height={pageHeight} scrollY={scrollY}>
        {live ? renderPage(i) : null}
      </Page>,
    );
  }

  return (
    <Animated.ScrollView
      ref={scroller}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onMomentumScrollEnd={settle}
      snapToInterval={pageHeight > 0 ? pageHeight : undefined}
      decelerationRate="fast"
      disableIntervalMomentum
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      keyboardShouldPersistTaps="handled"
      style={s.fill}
    >
      {pages}
    </Animated.ScrollView>
  );
});

function Page({
  index,
  height,
  scrollY,
  children,
}: {
  index: number;
  height: number;
  scrollY: SharedValue<number>;
  children: React.ReactNode;
}) {
  const anim = useAnimatedStyle(() => {
    if (height <= 0) return {};
    // 0 = đang đứng đúng trang, 1 = đã bị trang sau đè hết.
    const gone = interpolate(scrollY.value / height - index, [0, 1], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: 1 - gone * 0.7,
      transform: [{ translateY: gone * height * 0.55 }, { scale: 1 - gone * 0.1 }],
    };
  });

  return (
    <Animated.View style={[s.page, { height }, anim]}>
      <View style={s.fill}>{children}</View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  page: { overflow: 'hidden' },
});
