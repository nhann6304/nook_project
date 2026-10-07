/**
 * Chọn màu locket. Chấm tròn vẽ bằng sắc nhấn CỦA NỀN ĐANG DÙNG — trên nền
 * tối, "Lam" là lam nhạt chứ không phải denim, nên chấm phải đúng cái sẽ thấy.
 * Đổi là đổi ngay, không có nút "Lưu".
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Tap, Txt } from '@ui';
import { ACCENT_KEYS, paletteOf, radius, space, useColors, useStyles, type AccentKey } from '@design';

const DOT = 36;

export const AccentPicker = memo(function AccentPicker({
  current,
  names,
  label,
  onPick,
}: {
  current: AccentKey;
  names: Readonly<Record<AccentKey, string>>;
  /** Chữ cho trình đọc màn hình của cả nhóm. */
  label: string;
  onPick: (key: AccentKey) => void;
}) {
  const s = useStyles(make);
  return (
    <View style={s.row} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {ACCENT_KEYS.map((key) => (
        <Dot key={key} id={key} name={names[key]} selected={key === current} onPick={onPick} />
      ))}
    </View>
  );
});

const Dot = memo(function Dot({
  id,
  name,
  selected,
  onPick,
}: {
  id: AccentKey;
  name: string;
  selected: boolean;
  onPick: (key: AccentKey) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const swatch = paletteOf(c.scene, id);

  return (
    <Tap
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={name}
      onPress={() => onPick(id)}
      feedback="select"
      scaleTo={0.92}
      style={s.item}
    >
      <View style={[s.ring, selected && { borderColor: swatch.accent }]}>
        <View style={[s.dot, { backgroundColor: swatch.accent }]}>
          {selected ? <Icon name="check" size={16} color={swatch.onAccent} /> : null}
        </View>
      </View>
      <Txt variant="faint" tone={selected ? 'default' : 'muted'} numberOfLines={1}>
        {name}
      </Txt>
    </Tap>
  );
});

const make = () =>
  StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: space.xs },
    item: { alignItems: 'center', gap: space.xs, minWidth: DOT + space.lg },
    ring: {
      padding: 3,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    dot: {
      width: DOT,
      height: DOT,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
