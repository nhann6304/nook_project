/**
 * Segmented — thanh chuyển hai (hoặc ba) chế độ loại trừ nhau.
 *
 * Con trượt là MỘT khối chạy bằng Reanimated, không phải đổi nền của từng ô.
 * Đổi nền thì lựa chọn nhảy cóc; con trượt thì mắt bám theo được và người dùng
 * hiểu ngay hai ô này là một cặp.
 */
import { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { color, radius, spring } from '@design';
import { Txt } from './Txt';
import { Tap } from './Tap';

export type SegmentedOption<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const pos = useSharedValue(index);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value * ((width - PAD * 2) / Math.max(options.length, 1)) }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      onLayout={onLayout}
      style={s.track}
    >
      {width > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            s.thumb,
            { width: (width - PAD * 2) / Math.max(options.length, 1) },
            thumb,
          ]}
        />
      ) : null}

      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <Tap
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.label}
            feedback={on ? null : 'select'}
            scaleTo={1}
            style={s.segment}
            onPress={() => {
              if (on) return;
              pos.value = withSpring(i, spring.press);
              onChange(o.value);
            }}
          >
            <Txt variant="label" tone={on ? 'default' : 'muted'} style={s.label}>
              {o.label}
            </Txt>
          </Tap>
        );
      })}
    </View>
  );
}

const PAD = 3;

const s = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.full,
    padding: PAD,
  },
  thumb: {
    position: 'absolute',
    top: PAD,
    left: PAD,
    bottom: PAD,
    borderRadius: radius.full,
    backgroundColor: color.surfaceRaised,
  },
  segment: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14 },
});
