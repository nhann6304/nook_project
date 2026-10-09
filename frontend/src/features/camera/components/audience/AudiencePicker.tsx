/**
 * Hàng avatar chọn AI KHÔNG được xem ảnh — kiểu hàng người nhận của Locket.
 * Mặc định mọi người đều sáng (được xem); chạm một người là người đó mờ đi,
 * có dấu mắt gạch. Ô đầu "Tất cả" bật/tắt cả hàng.
 *
 * Dùng ở hai chỗ: dưới ảnh vừa chụp, và Cài đặt (người xem mặc định).
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Icon, Scroll, Tap, Txt } from '@ui';
import { radius, space, useColors, useStyles, type Palette } from '@design';

export type AudiencePerson = { id: string; name: string; uri?: string };

const SIZE = 48;

export const AudiencePicker = memo(function AudiencePicker({
  people,
  hidden,
  onToggle,
  onToggleAll,
  onSearch,
  searchLabel,
  allLabel,
  hiddenLabel,
  label,
}: {
  people: readonly AudiencePerson[];
  hidden: readonly string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  /** Mở bảng đầy đủ có ô tìm — góc đông người thì lướt hàng ngang không xuể. */
  onSearch: () => void;
  searchLabel: string;
  allLabel: string;
  /** Nhãn trợ năng cho người đang bị giấu, ví dụ "Yến — không xem được". */
  hiddenLabel: (name: string) => string;
  label: string;
}) {
  const s = useStyles(make);
  const c = useColors();
  const allOn = hidden.length === 0;

  return (
    <Scroll
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
      accessibilityLabel={label}
    >
      <Tap
        onPress={onSearch}
        feedback="select"
        scaleTo={0.92}
        style={s.item}
        accessibilityRole="button"
        accessibilityLabel={searchLabel}
      >
        <View style={s.all}>
          <Icon name="search" size={22} color={c.accent} />
        </View>
        <Txt variant="faint" tone="muted" numberOfLines={1}>
          {searchLabel}
        </Txt>
      </Tap>

      <Tap
        onPress={onToggleAll}
        feedback="select"
        scaleTo={0.92}
        style={s.item}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: allOn }}
        accessibilityLabel={allLabel}
      >
        <View style={[s.all, allOn && s.allOn]}>
          <Icon name="people" size={22} color={allOn ? c.onAccent : c.accent} />
        </View>
        <Txt variant="faint" tone={allOn ? 'accent' : 'muted'} numberOfLines={1}>
          {allLabel}
        </Txt>
      </Tap>

      {people.map((p) => {
        const off = hidden.includes(p.id);
        return (
          <Tap
            key={p.id}
            onPress={() => onToggle(p.id)}
            feedback="select"
            scaleTo={0.92}
            style={s.item}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !off }}
            accessibilityLabel={off ? hiddenLabel(p.name) : p.name}
          >
            <View style={off ? s.off : null}>
              <Avatar name={p.name} uri={p.uri} size={SIZE} ring={!off} recyclingKey={p.id} />
            </View>
            {off ? (
              <View style={s.badge}>
                <Icon name="eyeOff" size={14} color={c.onAccent} />
              </View>
            ) : null}
            <Txt variant="faint" tone={off ? 'faint' : 'default'} numberOfLines={1} style={s.name}>
              {p.name}
            </Txt>
          </Tap>
        );
      })}
    </Scroll>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    row: { gap: space.md, paddingHorizontal: space.lg, alignItems: 'flex-start' },
    item: { alignItems: 'center', gap: space.xs, width: SIZE + space.md },
    all: {
      width: SIZE,
      height: SIZE,
      borderRadius: radius.full,
      backgroundColor: c.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    allOn: { backgroundColor: c.accent },
    off: { opacity: 0.35 },
    badge: {
      position: 'absolute',
      top: SIZE - 18,
      right: 2,
      width: 22,
      height: 22,
      borderRadius: radius.full,
      backgroundColor: c.danger,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: c.bg,
    },
    name: { maxWidth: SIZE + space.md },
  });
