/**
 * Txt — MỌI chữ trong Nook đi qua đây.
 *
 * Ba việc mà <Text> trần không tự làm, và quên một cái là hỏng cả màn:
 *   1. Gắn đúng bộ chữ. RN không kế thừa fontFamily xuống con — quên là
 *      máy Android rơi về Roboto, tiếng Việt lệch hẳn nhịp so với iOS.
 *   2. Chặn trần phóng chữ theo từng bậc (maxScale). Người bật cỡ chữ lớn nhất
 *      mà không chặn thì tiêu đề đẩy nút ra khỏi màn.
 *   3. Lấy màu từ bảng màu đang chọn, không ai gõ hex.
 *
 * Cỡ chữ và MÀU gộp chung vào một bảng style dựng theo bảng màu: mỗi cặp
 * (bậc chữ × sắc thái) là MỘT mục đã đăng ký sẵn, nên lúc vẽ chỉ tra bảng chứ
 * không dựng object `{ color }` mới. Đây là component bị gọi nhiều nhất cả app,
 * một object thừa mỗi lần vẽ ở đây là hàng nghìn object mỗi lần cuộn feed.
 */
import { StyleSheet, Text, type TextProps } from 'react-native';
import { type, useStyles, type Palette } from '@design';

type Variant = keyof typeof type;
type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'onAccent' | 'danger' | 'mint' | 'honey';

const VARIANTS = Object.keys(type) as Variant[];
const TONES: Tone[] = [
  'default',
  'muted',
  'faint',
  'accent',
  'onAccent',
  'danger',
  'mint',
  'honey',
];

const toneColor = (c: Palette, tone: Tone): string =>
  tone === 'default'
    ? c.text
    : tone === 'muted'
      ? c.textMuted
      : tone === 'faint'
        ? c.textFaint
        : tone === 'accent'
          ? c.accent
          : tone === 'onAccent'
            ? c.onAccent
            : tone === 'danger'
              ? c.danger
              : tone === 'mint'
                ? c.mint
                : c.honey;

const make = (c: Palette) => {
  const sheet: Record<string, object> = { center: { textAlign: 'center' } };
  for (const v of VARIANTS) {
    const t = type[v];
    for (const tone of TONES) {
      sheet[`${v}_${tone}`] = {
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        fontFamily: t.fontFamily,
        color: toneColor(c, tone),
      };
    }
  }
  return StyleSheet.create(sheet);
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
  const s = useStyles(make);
  return (
    <Text
      maxFontSizeMultiplier={type[variant].maxScale}
      style={[s[`${variant}_${tone}`], center && s.center, style]}
      {...rest}
    />
  );
}
