/**
 * Slides — lướt NGANG từng trang (màn giới thiệu). Ruột là
 * react-native-pager-view: trang chạy theo ngón tay trên luồng gốc, cả hai hệ.
 *
 * Lướt dọc thì dùng `<Pager>` — PagerView dọc trên Android không ổn định.
 */
import { useImperativeHandle, useRef, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

export type SlidesHandle = { goTo: (index: number) => void };

export function Slides({
  ref,
  children,
  onIndexChange,
}: {
  ref?: Ref<SlidesHandle>;
  /** Mỗi con là một trang. */
  children: readonly React.ReactNode[];
  onIndexChange?: (index: number) => void;
}) {
  const pager = useRef<PagerView>(null);
  useImperativeHandle(ref, () => ({ goTo: (i) => pager.current?.setPage(i) }), []);
  return (
    <PagerView
      ref={pager}
      style={styles.fill}
      initialPage={0}
      overdrag
      onPageSelected={(e) => onIndexChange?.(e.nativeEvent.position)}
    >
      {children.map((child, i) => (
        <View key={i} style={styles.fill} collapsable={false}>
          {child}
        </View>
      ))}
    </PagerView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
