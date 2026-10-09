/**
 * Toggle — công tắc bật/tắt một dòng cài đặt.
 *
 * Không dùng `Switch` của hệ: mỗi máy một dáng, màu nhấn không theo bảng màu
 * người dùng chọn. Núm chạy trên luồng UI; cả hàng (chữ + công tắc) là một
 * vùng chạm, công tắc 30pt đứng một mình thì quá nhỏ để bấm trúng.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { duration, layout, radius, space, useColors, useStyles, type Palette } from '@design';
import { Tap } from '../button/Tap';
import { Txt } from '../typography/Txt';

const W = 50;
const H = 30;
const KNOB = 24;

export function Toggle({
  value,
  onChange,
  label,
  hint,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  /** Dòng phụ dưới nhãn — nói bật lên thì chuyện gì xảy ra. */
  hint?: string;
}) {
  const s = useStyles(make);
  const c = useColors();
  const on = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    on.set(withTiming(value ? 1 : 0, { duration: duration.fast }));
  }, [on, value]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.get(), [0, 1], [c.surfaceRaised, c.accent]),
  }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: on.get() * (W - KNOB - 6) }],
  }));

  return (
    <Tap
      onPress={() => onChange(!value)}
      scaleTo={1}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      style={s.row}
    >
      <View style={s.text}>
        <Txt variant="label">{label}</Txt>
        {hint ? (
          <Txt variant="faint" tone="muted">
            {hint}
          </Txt>
        ) : null}
      </View>
      <Animated.View style={[s.track, track]}>
        <Animated.View style={[s.knob, knob]} />
      </Animated.View>
    </Tap>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    row: {
      minHeight: layout.minTouch,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
    },
    text: { flex: 1, gap: 2 },
    track: { width: W, height: H, borderRadius: radius.full, padding: 3 },
    knob: {
      width: KNOB,
      height: KNOB,
      borderRadius: radius.full,
      backgroundColor: c.onPhotoText,
    },
  });
