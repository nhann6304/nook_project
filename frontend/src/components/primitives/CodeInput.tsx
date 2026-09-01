/**
 * CodeInput — ô nhập mã 6 số.
 *
 * Bên dưới sáu ô nhìn thấy chỉ có MỘT ô nhập thật, trong suốt, phủ lên trên.
 *
 * Làm sáu ô nhập riêng là cách hỏng, theo đúng thứ tự người ta gặp:
 *   · dán mã từ tin nhắn bị vỡ, chỉ vào được một ký tự
 *   · xoá lùi nhảy sai ô
 *   · và nặng nhất: mất tự điền mã — thứ người dùng đã quen có sẵn.
 *
 * Ô thật mang textContentType (iOS) và autoComplete='sms-otp' (Android) nên cả
 * hai hệ đều tự điền được.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { radius, space, useStyles, type, type Palette } from '@design';
import { Txt } from './Txt';

export type CodeInputProps = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  invalid?: boolean;
  autoFocus?: boolean;
  editable?: boolean;
  /** Chữ cho trình đọc màn hình, ví dụ "Mã gồm 6 chữ số". */
  label?: string;
};

export function CodeInput({
  value,
  onChange,
  length = 6,
  invalid = false,
  autoFocus = false,
  editable = true,
  label,
}: CodeInputProps) {
  const s = useStyles(make);
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const cells = useMemo(
    () => Array.from({ length }, (_, i) => value[i] ?? ''),
    [length, value],
  );

  const handleChange = useCallback(
    (t: string) => onChange(t.replace(/\D/g, '').slice(0, length)),
    [length, onChange],
  );

  const focus = useCallback(() => input.current?.focus(), []);

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable accessible={false} onPress={focus} style={s.wrap}>
      <View style={s.row} pointerEvents="none">
        {cells.map((ch, i) => (
          <View
            key={i}
            style={[
              s.cell,
              ch ? s.cellFilled : null,
              focused && editable && i === activeIndex ? s.cellActive : null,
              invalid ? s.cellInvalid : null,
            ]}
          >
            <Txt variant="title" style={s.char}>
              {ch}
            </Txt>
          </View>
        ))}
      </View>

      <TextInput
        ref={input}
        value={value}
        onChangeText={handleChange}
        editable={editable}
        autoFocus={autoFocus}
        caretHidden
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={length}
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        importantForAutofill="yes"
        accessibilityLabel={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={s.realInput}
      />
    </Pressable>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
  wrap: { width: '100%' },
  row: { flexDirection: 'row', gap: space.sm },
  cell: {
    flex: 1,
    // Máy gập mở ra rộng 674pt. Không chặn trần thì sáu ô kéo thành sáu cái hộp.
    maxWidth: 56,
    aspectRatio: 48 / 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: { backgroundColor: c.surface },
  cellActive: { borderColor: c.accent },
  cellInvalid: { borderColor: c.danger },
  char: { fontSize: type.title.fontSize },
  // Ô thật đè lên sáu ô giả: trong suốt nhưng vẫn nhận bàn phím và tự điền.
  realInput: { ...StyleSheet.absoluteFillObject, opacity: 0, color: 'transparent' },
});
