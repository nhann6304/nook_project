/**
 * Pager — lướt dọc từng trang một, kiểu Locket: camera là trang 0, mỗi khoảnh
 * khắc là một trang bên dưới.
 *
 * Trang đi THẲNG theo ngón tay, không hiệu ứng gì thêm (02/10/2026). Bản trước
 * cho trang cũ lún xuống + thu nhỏ + tối dần: khung ảnh trôi lệch nhịp ngón
 * tay nên nhìn như nhảy lên nhảy xuống, và Android vẽ khung camera dưới lớp
 * co giãn bị giật. `scrollY` vẫn chia ra cho thanh trên/dưới mờ theo.
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
  useAnimatedRef,
  useAnimatedScrollHandler,
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
        // Báo ngay, kể cả khi có trượt: cuộn bằng lệnh thì iOS không bắn
        // `onMomentumScrollEnd`, chờ nó là trang đích còn trống.
        setIndex(i);
        onIndexChange?.(i);
      },
    }),
    [onIndexChange, pageHeight, scroller],
  );

  const pages = [];
  for (let i = 0; i < count; i++) {
    const live = Math.abs(i - index) <= WINDOW || keep?.includes(i) === true;
    pages.push(
      <View key={i} style={[s.page, { height: pageHeight }]}>
        {live ? renderPage(i) : null}
      </View>,
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

const s = StyleSheet.create({
  fill: { flex: 1 },
  page: { overflow: 'hidden' },
});
