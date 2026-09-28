/**
 * Dải 7 ngày dưới nút chụp — "tuần này mình đã gửi gì". Mỗi ô là một ngày, có
 * ảnh thì hiện tấm mới nhất của ngày đó, không thì ô trống. Hôm nay nằm ngoài
 * cùng bên phải và có viền màu nhấn. Chạm cả dải → trang nhật ký.
 *
 * Không đếm chuỗi ngày, không nhắc "đừng làm mất chuỗi": Nook không biến việc
 * chụp thành nghĩa vụ.
 */
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Img, Tap, Txt } from '@ui';
import { layout, radius, space, useColors, useStyles, type Palette } from '@design';
import { dayKey, type Entry } from '../types';

const DAYS = 7;
const TILE_W = 30;

export const STRIP_HEIGHT = 92;

export const JournalStrip = memo(function JournalStrip({
  entries,
  weekdays,
  label,
  hint,
  onOpen,
  onHint,
}: {
  entries: readonly Entry[];
  /** "T2,T3,…,CN" — thứ Hai trước. */
  weekdays: readonly string[];
  label: string;
  hint: string;
  onOpen: () => void;
  onHint: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();

  const days = useMemo(() => {
    const byDay = new Map<string, Entry>();
    // `entries` mới nhất trước → tấm đầu tiên gặp của mỗi ngày là tấm mới nhất.
    for (const e of entries) {
      const k = dayKey(e.at);
      if (!byDay.has(k)) byDay.set(k, e);
    }
    const today = new Date();
    return Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (DAYS - 1 - i));
      // getDay(): 0 = Chủ nhật. Bảng tên bắt đầu từ thứ Hai.
      const wd = weekdays[(d.getDay() + 6) % 7] ?? '';
      return { key: dayKey(d), wd, entry: byDay.get(dayKey(d)), today: i === DAYS - 1 };
    });
  }, [entries, weekdays]);

  return (
    <View style={s.root}>
      <Tap onPress={onHint} feedback={null} style={s.hint} accessibilityLabel={hint}>
        <Ionicons name="chevron-up" size={16} color={c.textFaint} />
      </Tap>
      <Tap onPress={onOpen} scaleTo={0.97} style={s.row} accessibilityLabel={label}>
        {days.map((d) => (
          <View key={d.key} style={s.day}>
            <View style={[s.tile, d.today && s.today]}>
              {d.entry ? (
                <Img
                  source={d.entry.photo}
                  recyclingKey={d.entry.id}
                  style={s.photo}
                  transition={0}
                />
              ) : null}
            </View>
            <Txt variant="faint" tone={d.today ? 'accent' : 'faint'} style={s.wd}>
              {d.wd}
            </Txt>
          </View>
        ))}
      </Tap>
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    root: { height: STRIP_HEIGHT, alignItems: 'center' },
    hint: { height: 22, width: layout.minTouch, alignItems: 'center', justifyContent: 'center' },
    row: { flexDirection: 'row', gap: space.sm + 2, paddingVertical: space.xs },
    day: { alignItems: 'center', gap: 3 },
    tile: {
      width: TILE_W,
      height: Math.round(TILE_W / layout.cameraFrameRatio),
      borderRadius: radius.xs + 2,
      backgroundColor: c.surface,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    today: { borderColor: c.accent },
    photo: { width: '100%', height: '100%' },
    wd: { fontSize: 10, lineHeight: 13 },
  });
