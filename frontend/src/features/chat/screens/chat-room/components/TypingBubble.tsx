/** "Đang gõ…" — ba chấm nhún lệch nhịp trong một bong bóng, chạy trên luồng UI. */
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { duration, radius, space, useStyles, type Palette } from '@design';

export const TypingBubble = memo(function TypingBubble() {
  const s = useStyles(make);
  return (
    <Animated.View
      entering={FadeIn.duration(duration.fast)}
      exiting={FadeOut.duration(duration.fast)}
      style={s.row}
    >
      <View style={s.bubble}>
        {[0, 1, 2].map((i) => (
          <Dot key={i} delay={i * 160} />
        ))}
      </View>
    </Animated.View>
  );
});

function Dot({ delay }: { delay: number }) {
  const s = useStyles(make);
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(
      withDelay(
        delay,
        withRepeat(withSequence(withTiming(-4, { duration: 260 }), withTiming(0, { duration: 260 })), -1),
      ),
    );
  }, [delay, y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[s.dot, anim]} />;
}

const make = (c: Palette) =>
  StyleSheet.create({
    row: { paddingHorizontal: space.md, paddingVertical: space.xs, flexDirection: 'row' },
    bubble: {
      flexDirection: 'row',
      gap: 5,
      paddingHorizontal: space.md,
      paddingVertical: space.md,
      borderRadius: radius.lg,
      borderBottomLeftRadius: 4,
      backgroundColor: c.glass,
    },
    dot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: c.textFaint },
  });
