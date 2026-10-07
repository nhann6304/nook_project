/**
 * Năm cảnh của "Theo trời", mỗi ô vẽ bằng CHÍNH màu của cảnh đó (vệt trời +
 * chữ), ô đang dùng có viền màu nhấn. Chỉ để nhìn — chế độ chọn ở trên.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Txt } from '@ui';
import {
  SKY_SCENES,
  paletteOf,
  radius,
  space,
  useStyles,
  type AccentKey,
  type Palette,
  type SkyScene,
} from '@design';

export const SkyStrip = memo(function SkyStrip({
  current,
  accent,
  names,
  nowLabel,
}: {
  current: SkyScene | null;
  accent: AccentKey;
  names: Readonly<Record<SkyScene, string>>;
  nowLabel: string;
}) {
  const s = useStyles(make);
  return (
    <View style={s.row}>
      {SKY_SCENES.map((k) => {
        const p = paletteOf(k, accent);
        const now = k === current;
        return (
          <View key={k} style={[s.card, now && s.cardNow]}>
            <LinearGradient colors={[p.sky[0], p.sky[1]]} style={StyleSheet.absoluteFill} />
            <View style={[s.dot, { backgroundColor: p.accent }]} />
            <Txt variant="faint" style={[s.name, { color: p.text }]} numberOfLines={1}>
              {names[k]}
            </Txt>
            {now ? (
              <Txt variant="faint" style={[s.now, { color: p.textMuted }]} numberOfLines={1}>
                {nowLabel}
              </Txt>
            ) : null}
          </View>
        );
      })}
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: space.sm - 2 },
    card: {
      flex: 1,
      height: 84,
      borderRadius: radius.md,
      overflow: 'hidden',
      padding: space.sm,
      justifyContent: 'flex-end',
      borderWidth: 2,
      borderColor: c.border,
    },
    cardNow: { borderColor: c.accent },
    dot: {
      position: 'absolute',
      top: space.sm,
      right: space.sm,
      width: 10,
      height: 10,
      borderRadius: radius.full,
    },
    name: { fontSize: 12, lineHeight: 16 },
    now: { fontSize: 10, lineHeight: 13 },
  });
