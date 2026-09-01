/**
 * Wordmark — chữ "nook".
 *
 * Bộ chữ trưng bày (Fredoka) CHỈ dùng ở đây. Không dùng cho chữ tiếng Việt có
 * dấu ở chỗ khác: nó vẽ dấu không đủ đẹp, và chữ thân của app là Be Vietnam Pro.
 *
 * Chữ thường hết, không viết hoa: "nook" là một góc nhỏ, không phải một hãng.
 */
import { StyleSheet, View } from 'react-native';
import { color, font, space } from '@design';
import { Txt } from '../primitives/Txt';

export function Wordmark({ size = 34, tone = 'default' }: { size?: number; tone?: 'default' | 'accent' }) {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="nook">
      <Txt variant="display" tone={tone} style={[s.word, { fontSize: size, lineHeight: size * 1.18 }]}>
        nook
      </Txt>
    </View>
  );
}

/** Dấu hiệu + chữ nằm ngang. Chỉ dùng ở màn Chào mừng. */
export function Lockup({ children }: { children?: React.ReactNode }) {
  return <View style={s.lockup}>{children}</View>;
}

const s = StyleSheet.create({
  word: { fontFamily: font.display, letterSpacing: -0.5, color: color.text },
  lockup: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
