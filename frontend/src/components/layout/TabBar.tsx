/**
 * Thanh điều hướng dưới đáy (06/10/2026, thay luật "không thanh tab": người
 * dùng tìm không ra Cài đặt).
 *
 * Viên thuốc "kính" nổi trên nền (`glass` + viền sáng + `lift`), icon ĐẶC cho
 * dày, dễ thấy. Mượt trước đã:
 *   · nền ĐẶC, không blur — blur trên Android vẽ lại mỗi khung hình;
 *   · nằm TRONG dòng bố cục, không đè lên màn — nên mờ đi chứ không gỡ khi
 *     đang bận (gỡ ra là màn trên đổi cao, khung camera nhảy);
 *   · Android: bàn phím bật thì gỡ hẳn, nếu không thanh bị đẩy lên trên phím.
 */
import { memo, useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { font, layout, lift, radius, space, useColors, useStyles, type Palette } from '@design';
import { Tap } from '../primitives/Tap';
import { Txt } from '../primitives/Txt';
import type { IconName } from '../primitives/IconBadge';

export type TabItem<K extends string> = {
  key: K;
  label: string;
  /** Bản ĐẶC (`home`, không `home-outline`) — nét mảnh khó nhìn ngoài nắng. */
  icon: IconName;
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
      scaleTo={0.94}
      style={s.item}
    >
      <View style={[s.icon, selected && s.iconOn]}>
        <Ionicons name={item.icon} size={22} color={selected ? c.onAccent : c.textFaint} />
      </View>
      <Txt variant="faint" tone={selected ? 'accent' : 'faint'} numberOfLines={1} style={s.label}>
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
    dock: {
      paddingTop: space.sm,
      paddingHorizontal: space.xl,
      backgroundColor: c.bg,
    },
    dimmed: { opacity: 0.4 },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      height: TAB_BAR_HEIGHT,
      paddingHorizontal: space.sm,
      borderRadius: radius.full,
      backgroundColor: c.glass,
      borderWidth: 1,
      borderColor: c.glassBorder,
      ...lift(c),
    },
    item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: layout.minTouch },
    icon: {
      width: 48,
      height: 30,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconOn: { backgroundColor: c.accent },
    label: { fontFamily: font.bodySemi },
  });
