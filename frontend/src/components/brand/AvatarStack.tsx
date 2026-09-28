/**
 * Ba chữ cái chồng lên nhau — "ai đang ở trong góc" nói bằng hình, gọn trong
 * một viên thuốc. Không vòng độ thân ở đây: viên thuốc này ai đứng cạnh cũng
 * thấy được.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { font, radius, useStyles, type Palette } from '@design';
import { Txt } from '../primitives/Txt';

const SIZE = 24;

export const AvatarStack = memo(function AvatarStack({
  names,
  max = 3,
}: {
  names: readonly string[];
  max?: number;
}) {
  const s = useStyles(make);
  return (
    <View style={s.row}>
      {names.slice(0, max).map((n, i) => (
        <View
          key={`${n}-${i}`}
          style={[s.dot, i > 0 && s.overlap, [s.tint0, s.tint1, s.tint2][i % 3]]}
        >
          <Txt variant="faint" tone="onAccent" style={s.letter}>
            {n.charAt(0).toUpperCase()}
          </Txt>
        </View>
      ))}
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row' },
    dot: {
      width: SIZE,
      height: SIZE,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlap: { marginLeft: -8 },
    tint0: { backgroundColor: c.accentBright },
    tint1: { backgroundColor: c.accent2 },
    tint2: { backgroundColor: c.honey },
    letter: { fontSize: 10, lineHeight: 12, fontFamily: font.heavy },
  });
