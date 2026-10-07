/**
 * OfflineBar — viên mảnh "Đang chờ mạng" dưới thanh trên.
 *
 * Nằm ĐÈ lên nội dung (absolute), không đẩy gì xuống: mạng chập chờn mà mỗi
 * lần rớt là cả màn nhích xuống một nấc thì còn khó chịu hơn mất mạng.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Icon } from '../primitives/Icon';
import { duration, radius, space, useColors, useStyles, type Palette } from '@design';
import { Txt } from '../primitives/Txt';

export const OfflineBar = memo(function OfflineBar({
  visible,
  label,
}: {
  visible: boolean;
  label: string;
}) {
  const s = useStyles(make);
  const c = useColors();
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={s.slot}>
      <Animated.View
        entering={FadeIn.duration(duration.base)}
        exiting={FadeOut.duration(duration.base)}
        style={s.pill}
        accessibilityLiveRegion="polite"
      >
        <Icon name="offline" size={14} color={c.textMuted} />
        <Txt variant="faint" tone="muted">
          {label}
        </Txt>
      </Animated.View>
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    slot: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs + 2,
      height: 28,
      paddingHorizontal: space.md,
      borderRadius: radius.full,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
  });
