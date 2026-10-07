/**
 * Thanh điều hướng dưới đáy — bốn nút (07/10/2026).
 *
 * Hai bản trước đều bị chê: viên thuốc nổi ("như AI") và thanh liền mép
 * ("dính sát đáy"). Bản này là một THẺ nổi cách mép, bo vừa (không tròn hết),
 * icon trần không ô bao; nút đang chọn có vạch ngắn màu nhấn phía trên + chữ
 * đậm. Mượt trước đã:
 *   · nền ĐẶC, không blur — blur trên Android vẽ lại mỗi khung hình;
 *   · nằm TRONG dòng bố cục, không đè lên màn — nên mờ đi chứ không gỡ khi
 *     đang bận (gỡ ra là màn trên đổi cao, khung camera nhảy);
 *   · Android: bàn phím bật thì gỡ hẳn, nếu không thanh bị đẩy lên trên phím.
 */
import { memo, useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, layout, lift, radius, space, useColors, useStyles, type Palette } from '@design';
import { Icon, type IconName } from '../primitives/Icon';
import { Tap } from '../primitives/Tap';
import { Txt } from '../primitives/Txt';

export type TabItem<K extends string> = {
  key: K;
  label: string;
  icon: IconName;
  /** Chấm báo có thứ mới (tin nhắn chưa đọc). */
  badge?: boolean;
};

export const TAB_BAR_HEIGHT = 64;

function TabBarInner<K extends string>({
  items,
  active,
  onPress,
  dimmed,
  label,
}: {
  items: readonly TabItem<K>[];
  active: K;
  onPress: (key: K) => void;
  /** Đang bận (xem lại ảnh vừa chụp) — mờ và không nhận chạm. */
  dimmed?: boolean;
  /** Chữ cho trình đọc màn hình của cả thanh. */
  label: string;
}) {
  const s = useStyles(make);
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardOpen();

  if (keyboard && Platform.OS === 'android') return null;

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      pointerEvents={dimmed ? 'none' : 'auto'}
      style={[s.dock, { paddingBottom: Math.max(insets.bottom, space.md) }, dimmed && s.dimmed]}
    >
      <View style={s.bar}>
        {items.map((it) => (
          <Item key={it.key} item={it} selected={it.key === active} onPress={onPress} />
        ))}
      </View>
    </View>
  );
}

export const TabBar = memo(TabBarInner) as typeof TabBarInner;

const Item = memo(function Item<K extends string>({
  item,
  selected,
  onPress,
}: {
  item: TabItem<K>;
  selected: boolean;
  onPress: (key: K) => void;
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
      scaleTo={0.92}
      style={s.item}
    >
      <View style={[s.mark, selected && s.markOn]} />
      <View style={s.icon}>
        <Icon name={item.icon} size={24} color={selected ? c.accent : c.textFaint} />
        {item.badge ? <View style={s.badge} /> : null}
      </View>
      <Txt
        variant="faint"
        tone={selected ? 'accent' : 'muted'}
        numberOfLines={1}
        style={selected ? s.labelOn : s.label}
      >
        {item.label}
      </Txt>
    </Tap>
  );
}) as <K extends string>(p: {
  item: TabItem<K>;
  selected: boolean;
  onPress: (key: K) => void;
}) => React.ReactElement;

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
    dock: { paddingHorizontal: space.lg, paddingTop: space.xs, backgroundColor: c.bg },
    dimmed: { opacity: 0.4 },
    bar: {
      flexDirection: 'row',
      height: TAB_BAR_HEIGHT,
      borderRadius: radius.xl,
      backgroundColor: c.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      ...lift(c),
    },
    item: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: layout.minTouch },
    mark: {
      position: 'absolute',
      top: 0,
      width: 22,
      height: 3,
      borderBottomLeftRadius: radius.xs,
      borderBottomRightRadius: radius.xs,
      backgroundColor: 'transparent',
    },
    markOn: { backgroundColor: c.accent },
    icon: { height: 30, alignItems: 'center', justifyContent: 'center' },
    badge: {
      position: 'absolute',
      top: 0,
      right: -6,
      width: 10,
      height: 10,
      borderRadius: radius.full,
      backgroundColor: c.danger,
      borderWidth: 2,
      borderColor: c.glass,
    },
    label: { fontFamily: font.bodySemi },
    labelOn: { fontFamily: font.bodyBold },
  });
