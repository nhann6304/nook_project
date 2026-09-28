/**
 * Toast — một viên chữ ngắn trồi ra rồi tự đi. Người gọi lo hẹn giờ tắt; đổi
 * `id` là chạy lại hiệu ứng dù chữ giống hệt lần trước.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { duration, radius, space, spring, useStyles, type Palette } from '@design';
import { Txt } from '../primitives/Txt';

export function Toast({
  message,
  id,
  icon,
}: {
  message: string | null;
  id?: number;
  icon?: React.ReactNode;
}) {
  const s = useStyles(make);
  if (!message) return null;
  return (
    <View pointerEvents="none" style={s.slot}>
      <Animated.View
        key={id}
        entering={FadeInDown.springify()
          .damping(spring.enter.damping)
          .stiffness(spring.enter.stiffness)}
        exiting={FadeOutUp.duration(duration.base)}
        style={s.pill}
        accessibilityLiveRegion="polite"
      >
        {icon}
        <Txt variant="label">{message}</Txt>
      </Animated.View>
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    slot: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      minHeight: 40,
      paddingHorizontal: space.lg,
      borderRadius: radius.full,
      backgroundColor: c.surfaceRaised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
  });
