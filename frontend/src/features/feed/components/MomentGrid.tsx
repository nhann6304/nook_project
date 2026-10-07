/**
 * Lưới "Tất cả ảnh" — ba cột, chia theo ngày. Chạm một ô thì báo lên màn chính
 * kèm TOẠ ĐỘ ô đó trên màn hình, để màn chính mở "cửa sổ" từ đúng chỗ vừa chạm.
 */
import { memo, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, IconButton, Img, List, Tap, Txt } from '@ui';
import { layout, radius, space, useColors, useStyles, type Palette } from '@design';
import type { Moment } from '../types';

export type Rect = { x: number; y: number; w: number; h: number };

type Item =
  | { kind: 'head'; key: string; label: string }
  | { kind: 'cell'; key: string; moment: Moment; index: number };

const COLS = 3;

export function MomentGrid({
  moments,
  title,
  todayLabel,
  earlierLabel,
  backLabel,
  openLabel,
  onOpen,
  onClose,
}: {
  moments: readonly Moment[];
  title: string;
  todayLabel: string;
  earlierLabel: string;
  backLabel: string;
  openLabel: (name: string) => string;
  /** `index` là vị trí trong `moments`; `rect` là ô vừa chạm, toạ độ màn hình. */
  onOpen: (index: number, rect: Rect) => void;
  onClose: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();

  const items = useMemo(() => {
    const today = new Date().toDateString();
    const out: Item[] = [];
    let section: string | null = null;
    moments.forEach((m, index) => {
      const isToday = new Date(m.at).toDateString() === today;
      const label = isToday ? todayLabel : earlierLabel;
      if (label !== section) {
        section = label;
        out.push({ kind: 'head', key: `h-${label}`, label });
      }
      out.push({ kind: 'cell', key: m.id, moment: m, index });
    });
    return out;
  }, [earlierLabel, moments, todayLabel]);

  const renderItem = useCallback(
    ({ item }: { item: Item }) =>
      item.kind === 'head' ? (
        <Txt variant="label" tone="muted" style={s.day}>
          {item.label}
        </Txt>
      ) : (
        <Cell
          moment={item.moment}
          index={item.index}
          label={openLabel(item.moment.author.name)}
          onOpen={onOpen}
        />
      ),
    [onOpen, openLabel, s.day],
  );

  return (
    <View style={s.root}>
      <View style={s.bar}>
        <IconButton label={backLabel} onPress={onClose} style={s.back}>
          <Icon name="back" size={22} color={c.accent} />
        </IconButton>
        <Txt variant="title" style={s.title}>
          {title}
        </Txt>
      </View>
      <List
        data={items}
        numColumns={COLS}
        renderItem={renderItem}
        keyExtractor={keyOf}
        getItemType={typeOf}
        overrideItemLayout={span}
        contentContainerStyle={s.content}
      />
    </View>
  );
}

const keyOf = (i: Item) => i.key;
const typeOf = (i: Item) => i.kind;
const span = (l: { span?: number }, i: Item) => {
  if (i.kind === 'head') l.span = COLS;
};

const Cell = memo(function Cell({
  moment,
  index,
  label,
  onOpen,
}: {
  moment: Moment;
  index: number;
  label: string;
  onOpen: (index: number, rect: Rect) => void;
}) {
  const s = useStyles(make);
  const box = useRef<View>(null);

  const open = useCallback(() => {
    box.current?.measureInWindow((x, y, w, h) => onOpen(index, { x, y, w, h }));
  }, [index, onOpen]);

  return (
    <View style={s.cellWrap}>
      <Tap onPress={open} scaleTo={0.95} accessibilityLabel={label}>
        <View ref={box} style={s.cell} collapsable={false}>
          <Img source={moment.photo} recyclingKey={moment.id} style={s.photo} shimmer />
          <View style={s.who}>
            <Txt variant="faint" tone="onAccent" style={s.whoText}>
              {moment.author.name.charAt(0).toUpperCase()}
            </Txt>
          </View>
        </View>
      </Tap>
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    bar: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingHorizontal: space.sm,
    },
    back: { borderRadius: radius.full, backgroundColor: c.accentSoft },
    title: { fontSize: 22, lineHeight: 30 },
    content: { paddingHorizontal: space.md - 2, paddingBottom: 140 },
    day: { paddingHorizontal: space.xs, paddingTop: space.lg, paddingBottom: space.sm },
    cellWrap: { padding: 3 },
    cell: { aspectRatio: layout.cameraFrameRatio, borderRadius: radius.md, overflow: 'hidden' },
    photo: { width: '100%', height: '100%' },
    who: {
      position: 'absolute',
      left: space.sm,
      bottom: space.sm,
      width: 22,
      height: 22,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: c.bg,
      backgroundColor: c.accentBright,
      alignItems: 'center',
      justifyContent: 'center',
    },
    whoText: { fontSize: 11, lineHeight: 14 },
  });
