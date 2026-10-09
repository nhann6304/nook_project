/**
 * Nút zoom góc trên-phải khung ngắm — như Locket: một viên tròn "1×", chạm là
 * đổi vòng 1× → 2× → 0.5× (0.5× chỉ có khi máy có ống góc siêu rộng ở camera
 * sau). Cùng giọng với công tắc đèn ở góc đối diện.
 */
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Tap, Txt } from '@ui';
import { font, radius, useStyles, type Palette } from '@design';

export type ZoomLevel = 0.5 | 1 | 2;

export const ZoomChip = memo(function ZoomChip({
  level,
  label,
  onPress,
}: {
  level: ZoomLevel;
  label: string;
  onPress: () => void;
}) {
  const s = useStyles(make);
  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      feedback="select"
      scaleTo={0.9}
      style={s.box}
    >
      <Txt variant="faint" tone="onPhoto" style={s.text}>
        {level === 0.5 ? '.5×' : `${level}×`}
      </Txt>
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    box: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.onPhoto,
    },
    text: { fontFamily: font.heavy, fontSize: 13 },
  });
