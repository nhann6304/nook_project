/**
 * Txt — MỌI chữ trong Nook đi qua đây.
 *
 * Ba việc mà <Text> trần không tự làm, và quên một cái là hỏng cả màn:
 *   1. Gắn đúng bộ chữ. RN không kế thừa fontFamily xuống con — quên là
 *      máy Android rơi về Roboto, tiếng Việt lệch hẳn nhịp so với iOS.
 *   2. Chặn trần phóng chữ theo từng bậc (maxScale). Người bật cỡ chữ lớn nhất
 *      mà không chặn thì tiêu đề đẩy nút ra khỏi màn.
 *   3. Lấy màu từ token, không ai gõ hex.
 */
import { StyleSheet, Text, type TextProps } from 'react-native';
import { color, type } from '@design';

type Variant = keyof typeof type;
type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'onAccent' | 'danger' | 'mint' | 'honey';

const TONE: Record<Tone, string> = {
  default: color.text,
  muted: color.textMuted,
  faint: color.textFaint,
  accent: color.accent,
  onAccent: color.onAccent,
  danger: color.danger,
  mint: color.mint,
  honey: color.honey,
};

export type TxtProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
};

export function Txt({
  variant = 'body',
  tone = 'default',
  center,
  style,
  ...rest
}: TxtProps) {
  const t = type[variant];
  return (
    <Text
      maxFontSizeMultiplier={t.maxScale}
      style={[
        v[variant],
        { color: TONE[tone] },
        center && s.center,
        style,
      ]}
      {...rest}
    />
  );
}

const s = StyleSheet.create({ center: { textAlign: 'center' } });

// Dựng sẵn một lần lúc nạp module, không phải mỗi lần vẽ.
const v = StyleSheet.create({
  display: { fontSize: type.display.fontSize, lineHeight: type.display.lineHeight, fontFamily: type.display.fontFamily },
  title: { fontSize: type.title.fontSize, lineHeight: type.title.lineHeight, fontFamily: type.title.fontFamily },
  section: { fontSize: type.section.fontSize, lineHeight: type.section.lineHeight, fontFamily: type.section.fontFamily },
  body: { fontSize: type.body.fontSize, lineHeight: type.body.lineHeight, fontFamily: type.body.fontFamily },
  label: { fontSize: type.label.fontSize, lineHeight: type.label.lineHeight, fontFamily: type.label.fontFamily },
  faint: { fontSize: type.faint.fontSize, lineHeight: type.faint.lineHeight, fontFamily: type.faint.fontFamily },
});
