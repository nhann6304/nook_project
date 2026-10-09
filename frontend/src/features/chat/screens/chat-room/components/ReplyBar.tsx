/**
 * Dải "đang trả lời" trên ô soạn — trích một tin (giữ lâu → Trả lời) hoặc ghim
 * một khoảnh khắc (ảnh nhỏ). Thanh dọc màu nhấn như Telegram; X để bỏ.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { Icon, IconButton, Img, Txt } from '@ui';
import { duration, font, radius, space, useColors, useStyles, type Palette } from '@design';
import type { PhotoSource } from '@/features/feed/types';

export const ReplyBar = memo(function ReplyBar({
  title,
  text,
  photo,
  cancelLabel,
  onCancel,
}: {
  title: string;
  text?: string;
  photo?: PhotoSource;
  cancelLabel: string;
  onCancel: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <Animated.View
      entering={FadeInDown.duration(duration.base)}
      exiting={FadeOut.duration(duration.fast)}
      style={s.bar}
    >
      <Icon name="send" size={18} color={c.accent} />
      {photo !== undefined ? <Img source={photo} style={s.thumb} transition={0} /> : null}
      <View style={s.line}>
        <Txt variant="faint" tone="accent" numberOfLines={1} style={s.title}>
          {title}
        </Txt>
        {text ? (
          <Txt variant="faint" tone="muted" numberOfLines={1}>
            {text}
          </Txt>
        ) : null}
      </View>
      <IconButton label={cancelLabel} onPress={onCancel}>
        <Icon name="close" size={18} color={c.textMuted} />
      </IconButton>
    </Animated.View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingLeft: space.md,
      paddingVertical: 2,
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    thumb: { width: 34, height: 34, borderRadius: radius.xs },
    line: { flex: 1, borderLeftWidth: 3, borderLeftColor: c.accent, paddingLeft: space.sm },
    title: { fontFamily: font.bodyBold },
  });
