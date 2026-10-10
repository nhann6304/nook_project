/**
 * Thanh điều hướng dưới đáy — theo Locket (08/10/2026).
 *
 * Bản thẻ bốn nút có chữ bị chê "cực phức tạp". Bản này là MỘT VIÊN NHỎ nằm
 * giữa: ba icon khối đặc, không chữ (nhãn chỉ cho trình đọc màn hình), nút
 * đang chọn có nền tròn sáng hơn. Một màu — đang chọn `c.text`, còn lại
 * `c.textMuted`. Cài đặt không còn là tab: nó nằm trong trang cá nhân (avatar
 * góc phải màn Chụp).
 *
 * NỔI trên nội dung (08/10/2026, như Locket): viên là `<Glass>`, nội dung cuộn
 * xuống bên dưới lớp kính. Mỗi tab tự chừa đáy bằng `useTabBarSpace()`.
 * Đang bận thì mờ đi chứ không gỡ; Android bàn phím bật thì gỡ hẳn, nếu không
 * thanh bị đẩy lên trên phím.
 */
import { memo, useEffect, useState, type Ref } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout, radius, space, useColors, useStyles, type Palette } from '@design';
import { Glass } from '../layout/Glass';
import { Icon, type IconName } from '../icon/Icon';
import { Tap } from '../button/Tap';

export type TabItem<K extends string> = {
  key: K;
  label: string;
  icon: IconName;
  /** Chấm báo có thứ mới (tin nhắn chưa đọc). */
  badge?: boolean;
};

export const TAB_BAR_HEIGHT = 56;
const ITEM = 48;

function TabBarInner<K extends string>({
  items,
  active,
  onPress,
  dimmed,
  label,
  targetRefs,
}: {
  items: readonly TabItem<K>[];
  active: K;
  onPress: (key: K) => void;
  /** Đang bận (xem lại ảnh vừa chụp) — mờ và không nhận chạm. */
  dimmed?: boolean;
  /** Chữ cho trình đọc màn hình của cả thanh. */
  label: string;
  /** Cho tour chỉ nút đo vị trí từng nút. Tách khỏi `items`: ref nằm trong object là React Compiler không cho đọc object đó lúc vẽ. */
  targetRefs?: Partial<Record<K, Ref<View>>>;
}) {
  const s = useStyles(make);
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardOpen();

  if (keyboard && Platform.OS === 'android') return null;

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      pointerEvents={dimmed ? 'none' : 'box-none'}
      style={[s.dock, { paddingBottom: Math.max(insets.bottom, space.md) }, dimmed && s.dimmed]}
    >
      <Glass radius={radius.full} style={s.pill}>
        {items.map((it) => (
          <Item
            key={it.key}
            item={it}
            selected={it.key === active}
            onPress={onPress}
            targetRef={targetRefs?.[it.key]}
          />
        ))}
      </Glass>
    </View>
  );
}

export const TabBar = memo(TabBarInner) as typeof TabBarInner;

const Item = memo(function Item<K extends string>({
  item,
  selected,
  onPress,
  targetRef,
}: {
  item: TabItem<K>;
  selected: boolean;
  onPress: (key: K) => void;
  targetRef?: Ref<View>;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <Tap
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={item.label}
      onPress={() => onPress(item.key)}
      feedback="select"
      scaleTo={0.9}
      style={[s.item, selected && s.itemOn]}
    >
      <View ref={targetRef} collapsable={false} style={s.target} pointerEvents="none" />
      <Icon name={item.icon} size={22} color={selected ? c.text : c.textMuted} />
      {item.badge ? <View style={s.badge} /> : null}
    </Tap>
  );
}) as <K extends string>(p: {
  item: TabItem<K>;
  selected: boolean;
  onPress: (key: K) => void;
  targetRef?: Ref<View>;
}) => React.ReactElement;

/** Khoảng đáy mỗi tab phải chừa cho thanh nổi. */
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, space.md) + space.xs;
}

/** Ô trống cao đúng bằng thanh tab nổi — đặt cuối mỗi tab. */
export function TabBarSpacer() {
  const h = useTabBarSpace();
  return <View pointerEvents="none" style={[SPACER, { height: h }]} />;
}
const SPACER = { alignSelf: 'stretch' } as const;

function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

const make = (c: Palette) =>
  StyleSheet.create({
    dock: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
    dimmed: { opacity: 0.4 },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      height: TAB_BAR_HEIGHT,
      paddingHorizontal: (TAB_BAR_HEIGHT - ITEM) / 2,
    },
    item: {
      width: layout.minTouch + space.md,
      height: ITEM,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemOn: { backgroundColor: c.glassEdge },
    target: { ...StyleSheet.absoluteFill },
    badge: {
      position: 'absolute',
      top: 10,
      right: 16,
      width: 9,
      height: 9,
      borderRadius: radius.full,
      backgroundColor: c.danger,
    },
  });
