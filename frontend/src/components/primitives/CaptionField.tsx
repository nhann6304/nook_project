/**
 * CaptionField — ô nhập nổi TRÊN ẢNH, dáng viên thuốc.
 *
 * Không dùng `<Field>`: Field có viền và nền bề mặt, đặt lên ảnh trông như một
 * hộp thoại dán đè. Ở đây cần đúng dáng cái pill "Thêm một dòng…" mà người dùng
 * vừa nhìn thấy ở màn chụp — họ chạm vào đúng chỗ đó và nó thành ô gõ, không có
 * gì mới xuất hiện.
 *
 * **Có icon bút chì khi ô còn trống.** Một ô nhập trong suốt nằm trên ảnh thì
 * không có gì nói cho người dùng biết nó gõ được — chữ mờ giữa ảnh trông y hệt
 * một dòng chú thích. Icon là thứ duy nhất nói ra điều đó. Gõ chữ đầu tiên là
 * icon biến mất, vì lúc đó không cần nói nữa và nó chiếm chỗ của chữ.
 *
 * Cả viên thuốc đều bấm được, không chỉ riêng ô chữ: vùng chạm của một dòng
 * chữ 14pt là quá nhỏ.
 *
 * Nằm ở src/components chứ không ở tính năng camera vì nó chạm thẳng vào
 * `TextInput` thô — thứ chỉ src/components được phép.
 */
import { forwardRef, useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, space, useColors, useStyles, type, type Palette } from '@design';

export const CAPTION_MAX = 80;

export type CaptionFieldProps = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  /** Chữ cho trình đọc màn hình, ví dụ "Thêm một dòng cho ảnh". */
  label: string;
  editable?: boolean;
};

export const CaptionField = forwardRef<TextInput, CaptionFieldProps>(function CaptionField(
  { value, onChangeText, placeholder, label, editable = true },
  _ref,
) {
  const s = useStyles(make);
  const c = useColors();
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const focus = useCallback(() => input.current?.focus(), []);

  const showIcon = value.length === 0 && !focused;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={focus}
      disabled={!editable}
      style={[s.pill, focused && s.pillFocused]}
    >
      {showIcon ? (
        <Ionicons name="create-outline" size={16} color={c.text} style={s.icon} />
      ) : null}

      <View style={s.inputBox}>
        <TextInput
          ref={input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.text}
          selectionColor={c.accent}
          cursorColor={c.accent}
          maxLength={CAPTION_MAX}
          editable={editable}
          multiline
          numberOfLines={2}
          textAlign="center"
          maxFontSizeMultiplier={type.body.maxScale}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={s.input}
        />
      </View>
    </Pressable>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
  pill: {
    maxWidth: '86%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: c.onPhoto,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    // Viền LUÔN có, chỉ đổi màu khi focus — cộng viền lúc focus làm viên thuốc
    // cao thêm 2px và cả khối nhích một nấc ngay lúc bàn phím đang bật lên.
    borderWidth: 1,
    borderColor: c.hairlineOnPhoto,
  },
  pillFocused: { borderColor: c.accent },
  icon: { opacity: 0.8 },
  inputBox: { flexShrink: 1 },
  input: {
    color: c.text,
    fontSize: type.body.fontSize,
    lineHeight: type.body.lineHeight,
    fontFamily: type.body.fontFamily,
    // Android cộng thêm đệm dọc riêng cho multiline; không tắt thì viên thuốc
    // cao hơn hẳn so với iOS.
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
});
