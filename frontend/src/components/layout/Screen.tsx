/**
 * Screen — khung ngoài cùng của MỌI màn.
 *
 * Nó lo bốn thứ mà nếu để mỗi màn tự lo thì chắc chắn có màn quên:
 *   1. Nền tối. Quên là thấy một khoảng trắng loé lên lúc chuyển màn.
 *   2. Chắn tai thỏ / thanh điều hướng, hỏi hệ điều hành chứ không gõ số tay.
 *      Đây là câu trả lời cho "iPhone cũ mới và Samsung có vừa không":
 *      không màn nào biết mình đang chạy trên máy gì.
 *   3. Bàn phím đẩy nội dung lên (iOS) — Android đã có adjustResize trong app.json.
 *   4. Lề ngang chuẩn.
 */
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { layout, useStyles, type Palette } from '@design';

export type ScreenProps = {
  children: React.ReactNode;
  /** Bỏ lề ngang — dùng cho màn camera và feed tràn viền. */
  padded?: boolean;
  /** Cạnh nào cần chừa chắn. Màn camera thường chỉ cần 'top'. */
  edges?: readonly Edge[];
  /** Bật khi màn có ô nhập. */
  keyboard?: boolean;
};

export function Screen({
  children,
  padded = true,
  edges = ['top', 'bottom'],
  keyboard = false,
}: ScreenProps) {
  const s = useStyles(make);
  const body = <View style={[s.body, padded && s.padded]}>{children}</View>;

  return (
    <SafeAreaView style={s.root} edges={edges}>
      {keyboard ? (
        <KeyboardAvoidingView
          style={s.body}
          // Android đã tự co màn nhờ softwareKeyboardLayoutMode='resize' trong
          // app.json. Thêm 'height' ở đây nữa là co hai lần, màn nhảy.
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  body: { flex: 1 },
  padded: { paddingHorizontal: layout.screenPadding },
});
