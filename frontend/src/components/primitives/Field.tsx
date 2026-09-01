/**
 * Field — ô nhập một dòng.
 *
 * Hai quyết định nhìn thì nhỏ nhưng giữ cho màn không nhảy:
 *
 *   1. Cao 52 chứ không phải 40. Đây là thứ ngón cái phải bấm trúng ngay lần đầu.
 *   2. Viền LUÔN tồn tại, chỉ đổi MÀU khi focus hoặc lỗi — không cộng thêm viền.
 *      Cộng viền lúc focus làm ô cao thêm 2px, đẩy mọi thứ bên dưới nhích một
 *      nấc đúng lúc bàn phím đang bật lên. Người dùng thấy màn "giật".
 */
import { forwardRef, useCallback, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { color, layout, radius, space, type } from '@design';

export type FieldProps = TextInputProps & {
  /** Khối cố định nằm trước ô gõ, ví dụ "+84". */
  prefix?: React.ReactNode;
  /** Khối nằm sau ô gõ, ví dụ nút xoá. */
  suffix?: React.ReactNode;
  invalid?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { prefix, suffix, invalid = false, containerStyle, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
    (e) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
    (e) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  return (
    <View style={[s.box, focused && s.focused, invalid && s.invalid, containerStyle]}>
      {prefix}
      <TextInput
        ref={ref}
        style={[s.input, style]}
        placeholderTextColor={color.textFaint}
        selectionColor={color.accent}
        cursorColor={color.accent}
        maxFontSizeMultiplier={type.body.maxScale}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {suffix}
    </View>
  );
});

const s = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.controlHeight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
    paddingHorizontal: space.lg,
    gap: space.sm,
  },
  focused: { borderColor: color.accent },
  invalid: { borderColor: color.danger },
  input: {
    flex: 1,
    color: color.text,
    fontSize: type.body.fontSize,
    fontFamily: type.body.fontFamily,
    paddingVertical: space.md,
  },
});
