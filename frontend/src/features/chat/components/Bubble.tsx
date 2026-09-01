/**
 * Một bong bóng tin nhắn.
 *
 * Tin của người kia: căn trái, nền bề mặt, chữ sáng.
 * Tin của mình: căn phải, nền màu nhấn, chữ TỐI — chữ trắng trên màu nhấn chỉ
 * đạt khoảng 2:1 ở mọi bảng màu, không đọc được ngoài nắng.
 *
 * Góc bo: ba góc tròn đều, góc phía "chân" bong bóng bo nhỏ hơn. Đó là thứ duy
 * nhất nói ra hướng của tin mà không cần thêm cái đuôi nhọn — đuôi nhọn phải vẽ
 * bằng SVG riêng và trên Android hay lệch một pixel.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Txt } from '@ui';
import { radius, space, useStyles, type Palette } from '@design';

export const Bubble = memo(function Bubble({ text, mine }: { text: string; mine: boolean }) {
  const s = useStyles(make);
  return (
    <View style={[s.row, mine ? s.rowMine : s.rowTheirs]}>
      <View style={[s.bubble, mine ? s.mine : s.theirs]}>
        <Txt variant="body" tone={mine ? 'onAccent' : 'default'}>
          {text}
        </Txt>
      </View>
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    row: { paddingHorizontal: space.lg, paddingVertical: space.xs },
    rowMine: { alignItems: 'flex-end' },
    rowTheirs: { alignItems: 'flex-start' },

    bubble: {
      maxWidth: '78%',
      paddingHorizontal: space.lg,
      paddingVertical: space.md,
      borderRadius: radius.lg,
    },
    mine: { backgroundColor: c.accent, borderBottomRightRadius: radius.xs },
    theirs: { backgroundColor: c.surface, borderBottomLeftRadius: radius.xs },
  });
