/**
 * CaptionField — ô nhập nổi TRÊN ẢNH.
 *
 * Không dùng `<Field>`: Field có viền và nền bề mặt, đặt lên ảnh trông như một
 * hộp thoại dán đè. Ở đây cần đúng dáng cái pill "Thêm một dòng…" mà người
 * dùng vừa nhìn thấy ở màn chụp — họ chạm vào đúng chỗ đó và nó thành ô gõ,
 * không có gì mới xuất hiện.
 *
 * Nằm ở src/components chứ không ở tính năng camera vì nó chạm thẳng vào
 * `TextInput` thô — mà đó là thứ chỉ src/components được phép (ESLint chặn ở
 * mọi chỗ khác, và nó vừa bắt đúng lỗi này).
 *
 * Ô tự rộng ra theo chữ (tối đa 2 dòng) rồi mới xuống dòng. Giới hạn 80 ký tự:
 * caption dài hơn thì che mất ảnh, mà ảnh mới là thứ đang được gửi.
 */
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { alpha, color, radius, space, type } from '@design';

export const CAPTION_MAX = 80;

export function CaptionField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <RNTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={color.textMuted}
      selectionColor={color.accent}
      cursorColor={color.accent}
      maxLength={CAPTION_MAX}
      multiline
      numberOfLines={2}
      textAlign="center"
      maxFontSizeMultiplier={type.body.maxScale}
      style={s.input}
    />
  );
}

const s = StyleSheet.create({
  input: {
    maxWidth: '86%',
    backgroundColor: alpha.onPhoto,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    color: color.text,
    fontSize: type.body.fontSize,
    lineHeight: type.body.lineHeight,
    fontFamily: type.body.fontFamily,
  },
});
