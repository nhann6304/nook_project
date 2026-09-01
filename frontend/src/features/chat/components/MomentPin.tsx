/**
 * Tấm ảnh mở ra cuộc trò chuyện, ghim ngay dưới thanh trên.
 *
 * Không có nó thì hai người mở lại tin cũ sẽ không biết đang nói về cái gì —
 * Nook không có tin nhắn "chung chung", mọi cuộc trò chuyện đều bắt đầu từ một
 * khoảnh khắc cụ thể. Cái ghim này là câu trả lời cho "ảnh nào?".
 *
 * Nó KHÔNG cuộn theo tin nhắn: cuộn mất là mất luôn ngữ cảnh, đúng lúc cuộc
 * trò chuyện dài ra và người ta cần nó nhất.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Img, Txt } from '@ui';
import { radius, space, useStyles, type Palette } from '@design';
import type { PhotoSource } from '@/features/feed/types';

const THUMB = 44;

export const MomentPin = memo(function MomentPin({
  photo,
  caption,
  label,
}: {
  photo: PhotoSource;
  caption?: string;
  /** "Về khoảnh khắc này" — hiện khi tấm ảnh không có caption. */
  label: string;
}) {
  const s = useStyles(make);
  return (
    <View style={s.box}>
      <Img source={photo} recyclingKey="pin" style={s.thumb} contentFit="cover" />
      <View style={s.words}>
        <Txt variant="faint" tone="faint">
          {label}
        </Txt>
        {caption ? (
          <Txt variant="label" numberOfLines={1}>
            {caption}
          </Txt>
        ) : null}
      </View>
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    box: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      marginHorizontal: space.lg,
      marginBottom: space.sm,
      padding: space.sm,
      borderRadius: radius.md,
      backgroundColor: c.surfaceSunken,
    },
    thumb: { width: THUMB, height: THUMB, borderRadius: radius.sm },
    words: { flex: 1, gap: 2 },
  });
