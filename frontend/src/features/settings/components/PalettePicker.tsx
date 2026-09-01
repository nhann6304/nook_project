/**
 * Chọn bảng màu.
 *
 * Mỗi lựa chọn là một mẫu THẬT chứ không phải một chấm màu: ba vòng tròn xếp
 * chồng lấy đúng ba màu quyết định cảm giác của bảng — nền, bề mặt, sắc chính.
 * Một chấm màu nhấn đơn lẻ không nói được bảng đó có nền ngả xanh hay ngả tím,
 * mà đó mới là thứ người ta nhìn suốt cả ngày.
 *
 * Đổi là ĐỔI NGAY, không có nút "Lưu". Người ta chọn màu bằng cách nhìn nó,
 * không phải bằng cách tưởng tượng ra nó rồi bấm xác nhận.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Scroll, Tap, Txt } from '@ui';
import {
  PALETTES,
  PALETTE_KEYS,
  radius,
  space,
  useColors,
  useStyles,
  type Palette,
  type PaletteKey,
} from '@design';

const SWATCH = 56;

export const PalettePicker = memo(function PalettePicker({
  current,
  names,
  label,
  onPick,
}: {
  current: PaletteKey;
  /** Tên hiển thị của từng bảng, đã dịch. */
  names: Readonly<Record<PaletteKey, string>>;
  /** Chữ cho trình đọc màn hình của cả nhóm. */
  label: string;
  onPick: (key: PaletteKey) => void;
}) {
  const s = useStyles(make);

  return (
    <Scroll
      horizontal
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      contentContainerStyle={s.row}
      showsHorizontalScrollIndicator={false}
    >
      {PALETTE_KEYS.map((key) => (
        <Swatch
          key={key}
          palette={PALETTES[key]}
          name={names[key]}
          selected={key === current}
          onPick={onPick}
        />
      ))}
    </Scroll>
  );
});

const Swatch = memo(function Swatch({
  palette,
  name,
  selected,
  onPick,
}: {
  palette: Palette;
  name: string;
  selected: boolean;
  onPick: (key: PaletteKey) => void;
}) {
  const s = useStyles(make);
  const c = useColors();

  return (
    <Tap
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={name}
      onPress={() => onPick(palette.key)}
      feedback="select"
      scaleTo={0.94}
      style={s.item}
    >
      {/* Mẫu vẽ bằng màu CỦA BẢNG ĐÓ, không phải bảng đang dùng — nên nó không
          đi qua useStyles mà lấy thẳng từ `palette`. */}
      <View
        style={[
          s.swatch,
          { backgroundColor: palette.bg, borderColor: selected ? c.accent : palette.border },
          selected && s.swatchOn,
        ]}
      >
        <View style={[s.chipBack, { backgroundColor: palette.surfaceRaised }]} />
        <View style={[s.chipFront, { backgroundColor: palette.accent }]} />
        {selected ? (
          <View style={[s.tick, { backgroundColor: palette.accent }]}>
            <Ionicons name="checkmark" size={12} color={palette.onAccent} />
          </View>
        ) : null}
      </View>

      <Txt variant="faint" tone={selected ? 'default' : 'muted'} numberOfLines={1}>
        {name}
      </Txt>
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    row: { gap: space.md, paddingVertical: space.xs },
    item: { alignItems: 'center', gap: space.sm, width: SWATCH + space.md },

    swatch: {
      width: SWATCH,
      height: SWATCH,
      borderRadius: radius.md,
      borderWidth: 1.5,
      overflow: 'hidden',
    },
    swatchOn: { borderWidth: 2 },

    // Hai khối chéo góc: đủ để thấy nền, bề mặt và sắc chính cùng lúc.
    chipBack: {
      position: 'absolute',
      left: -8,
      top: 14,
      width: SWATCH,
      height: SWATCH,
      transform: [{ rotate: '-20deg' }],
    },
    chipFront: {
      position: 'absolute',
      right: -10,
      bottom: -14,
      width: SWATCH * 0.8,
      height: SWATCH * 0.8,
      borderRadius: radius.sm,
      transform: [{ rotate: '-20deg' }],
    },

    tick: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.bg,
    },
  });
