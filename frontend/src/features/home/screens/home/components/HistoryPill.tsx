/**
 * Viên "Lịch sử" dưới nút chụp — theo Locket (08/10/2026). Thay dải 7 ngày
 * (bị chê "đặt cái lịch vào đó là thấy xấu"): một viên nhỏ, số ảnh đang chờ
 * xem trong ô màu nhấn, chữ, mũi tên xuống. Chạm = lướt xuống ảnh bạn bè.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Tap, Txt } from '@ui';
import { TourTarget } from '@/features/onboarding/components/tour/TourTarget';
import { font, radius, space, useColors, useStyles, type Palette } from '@design';

export const HistoryPill = memo(function HistoryPill({
  count,
  label,
  onPress,
}: {
  count: number;
  label: string;
  onPress: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View style={s.root}>
      <TourTarget id="history">
        <Tap onPress={onPress} scaleTo={0.95} style={s.pill} accessibilityLabel={label}>
          {count > 0 ? (
            <View style={s.count}>
              <Txt variant="label" tone="onAccent" style={s.countText}>
                {count > 99 ? '99+' : String(count)}
              </Txt>
            </View>
          ) : null}
          <Txt variant="label">{label}</Txt>
          <Icon name="down" size={16} color={c.textMuted} />
        </Tap>
      </TourTarget>
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      height: 44,
      paddingHorizontal: space.md,
      borderRadius: radius.full,
    },
    count: {
      minWidth: 28,
      height: 28,
      paddingHorizontal: space.xs,
      borderRadius: radius.sm,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countText: { fontFamily: font.bodyBold },
  });
