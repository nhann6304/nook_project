/**
 * ComposerField — ô soạn dạng viên thuốc, có nút gửi. Dùng ở đáy màn Trò chuyện.
 *
 * Nằm ở src/components chứ không ở tính năng chat vì nó chạm thẳng vào
 * `TextInput` thô — thứ chỉ src/components được phép (ESLint chặn mọi chỗ khác,
 * và nó vừa bắt đúng lỗi này).
 *
 * Nút gửi chỉ SÁNG LÊN khi đã có chữ. Một nút gửi luôn sáng mà bấm không gửi
 * được là đúng cái bẫy "bấm không ăn" mà cả dự án đang tránh; còn ẩn hẳn nút đi
 * thì ô nhập nhảy chiều rộng mỗi lần gõ chữ đầu và xoá chữ cuối.
 *
 * Ô cao dần theo chữ tới trần bốn dòng rồi mới cuộn bên trong. Không chặn trần
 * thì dán một đoạn dài vào là ô ăn hết màn hình.
 */
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tap } from './Tap';
import { radius, space, type, useColors, useStyles, type Palette } from '@design';

const MAX_LENGTH = 500;

export function ComposerField({
  placeholder,
  sendLabel,
  onSend,
}: {
  placeholder: string;
  sendLabel: string;
  onSend: (text: string) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const [text, setText] = useState('');
  const ready = text.trim().length > 0;

  const send = useCallback(() => {
    const body = text.trim();
    if (!body) return;
    setText('');
    onSend(body);
  }, [onSend, text]);

  return (
    <View style={s.dock}>
      <View style={s.pill}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={c.textFaint}
          selectionColor={c.accent}
          cursorColor={c.accent}
          maxLength={MAX_LENGTH}
          multiline
          maxFontSizeMultiplier={type.body.maxScale}
          style={s.input}
        />

        <Tap
          accessibilityRole="button"
          accessibilityLabel={sendLabel}
          accessibilityState={{ disabled: !ready }}
          disabled={!ready}
          onPress={send}
          feedback="confirm"
          scaleTo={0.9}
          style={[s.send, ready ? s.sendOn : s.sendOff]}
        >
          <Ionicons name="arrow-up" size={18} color={ready ? c.onAccent : c.textFaint} />
        </Tap>
      </View>
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    dock: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.sm },
    pill: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: space.sm,
      padding: space.xs,
      paddingLeft: space.lg,
      borderRadius: radius.xl,
      backgroundColor: c.surface,
    },
    input: {
      flex: 1,
      // Trần bốn dòng. Cộng đệm dọc của chính ô nhập.
      maxHeight: type.body.lineHeight * 4 + space.md * 2,
      paddingVertical: space.md,
      color: c.text,
      fontSize: type.body.fontSize,
      lineHeight: type.body.lineHeight,
      fontFamily: type.body.fontFamily,
      // Android cộng thêm đệm dọc riêng cho multiline; không tắt thì viên thuốc
      // cao hơn hẳn so với iOS.
      textAlignVertical: 'center',
    },
    send: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendOn: { backgroundColor: c.accent },
    sendOff: { backgroundColor: c.surfaceRaised },
  });
