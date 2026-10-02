/**
 * Hàng gợi ý bạn để tag — hiện ngay trên ô chú thích khi đang gõ "@…".
 * Chỉ bạn đã chung góc. Chạm một người là chữ "@dở" thành "@username ".
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Avatar, Scroll, Tap, Txt } from '@ui';
import { duration, radius, space, useStyles, type Palette } from '@design';
import type { Tag } from '@/features/feed/types';

export const TagSuggestions = memo(function TagSuggestions({
  people,
  label,
  onPick,
}: {
  people: readonly Tag[];
  /** Nhãn trợ năng cho từng người, ví dụ "Tag Hưng". */
  label: (name: string) => string;
  onPick: (tag: Tag) => void;
}) {
  const s = useStyles(make);
  if (people.length === 0) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(duration.fast)}
      exiting={FadeOut.duration(duration.fast)}
      style={s.wrap}
    >
      <Scroll horizontal keyboardShouldPersistTaps="always" contentContainerStyle={s.row}>
        {people.map((p) => (
          <Tap
            key={p.id}
            onPress={() => onPick(p)}
            scaleTo={0.95}
            accessibilityLabel={label(p.name)}
            style={s.chip}
          >
            <Avatar name={p.name} ring={false} size={26} />
            <View>
              <Txt variant="label" tone="onPhoto" numberOfLines={1}>
                {p.name}
              </Txt>
            </View>
          </Tap>
        ))}
      </Scroll>
    </Animated.View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    wrap: { alignSelf: 'stretch', marginBottom: space.sm },
    row: { gap: space.sm, paddingHorizontal: space.lg },
    chip: {
      height: 38,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingLeft: space.xs + 2,
      paddingRight: space.md,
      borderRadius: radius.full,
      backgroundColor: c.onPhoto,
      borderWidth: 1,
      borderColor: c.hairlineOnPhoto,
    },
  });
