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
import { color, radius, space, type } from '@design';
import { Txt } from './Txt';

export type CodeInputProps = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  invalid?: boolean;
  autoFocus?: boolean;
  editable?: boolean;
};

export function CodeInput({
  value,
  onChange,
  length = 6,
  invalid = false,
  autoFocus = false,
  editable = true,
}: CodeInputProps) {
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
        accessibilityLabel={`Mã gồm ${length} chữ số`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={s.realInput}
      />
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { width: '100%' },
  row: { flexDirection: 'row', gap: space.sm },
  cell: {
    flex: 1,
    // Máy gập mở ra rộng 674pt. Không chặn trần thì sáu ô kéo thành sáu cái hộp.
    maxWidth: 56,
    aspectRatio: 48 / 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: { backgroundColor: color.surface },
  cellActive: { borderColor: color.accent },
  cellInvalid: { borderColor: color.danger },
  char: { fontSize: type.title.fontSize },
  // Ô thật đè lên sáu ô giả: trong suốt nhưng vẫn nhận bàn phím và tự điền.
  realInput: { ...StyleSheet.absoluteFillObject, opacity: 0, color: 'transparent' },
});
