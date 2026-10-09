/**
 * Xem trước giao diện CHƯA lưu: một màn chính thu nhỏ vẽ bằng bảng màu được
 * truyền vào (không phải bảng đang dùng) — vệt trời, khung ảnh, ô trả lời, nút,
 * thanh tab. Đổi lựa chọn là thấy ngay ở đây; app thật chỉ đổi khi bấm Lưu.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Txt } from '@ui';
import { radius, space, useStyles, type Palette } from '@design';

export const ThemePreview = memo(function ThemePreview({
  palette: p,
  caption,
  button,
}: {
  palette: Palette;
  /** Dòng chữ mẫu, ví dụ tên cảnh "Chiều · Lam". */
  caption: string;
  button: string;
}) {
  const s = useStyles(make);
  return (
    <View style={[s.phone, { backgroundColor: p.bg, borderColor: p.border }]}>
      <LinearGradient colors={[p.sky[0], p.sky[1]]} style={s.sky} />
      <View style={[s.pill, { backgroundColor: p.glass, borderColor: p.border }]}>
        <Txt variant="faint" style={[s.small, { color: p.text }]} numberOfLines={1}>
          {caption}
        </Txt>
      </View>
      <View style={[s.frame, { backgroundColor: p.surfaceRaised }]}>
        <Icon name="image" size={28} color={p.accent} />
      </View>
      <View style={[s.reply, { backgroundColor: p.surface }]}>
        <View style={[s.line, { backgroundColor: p.textFaint }]} />
        <Icon name="heart" size={14} color={p.danger} />
      </View>
      <View style={[s.button, { backgroundColor: p.accent }]}>
        <Txt variant="faint" style={[s.small, { color: p.onAccent }]} numberOfLines={1}>
          {button}
        </Txt>
      </View>
      <View style={[s.tabs, { backgroundColor: p.glass, borderColor: p.border }]}>
        <Icon name="camera" size={14} color={p.accent} />
        <Icon name="people" size={14} color={p.textFaint} />
        <Icon name="chat" size={14} color={p.textFaint} />
        <Icon name="settings" size={14} color={p.textFaint} />
      </View>
    </View>
  );
});

const make = () =>
  StyleSheet.create({
    phone: {
      alignSelf: 'center',
      width: 170,
      height: 300,
      borderRadius: radius.xl,
      borderWidth: 1.5,
      overflow: 'hidden',
      alignItems: 'center',
      paddingTop: space.md,
      gap: space.sm,
    },
    sky: { position: 'absolute', left: 0, right: 0, top: 0, height: 120 },
    pill: {
      paddingHorizontal: space.md,
      paddingVertical: 2,
      borderRadius: radius.full,
      borderWidth: StyleSheet.hairlineWidth,
      maxWidth: '86%',
    },
    small: { fontSize: 10, lineHeight: 14 },
    frame: {
      width: 140,
      height: 140 / 0.9,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reply: {
      width: 140,
      height: 22,
      borderRadius: radius.full,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.sm,
    },
    line: { width: 60, height: 4, borderRadius: radius.full, opacity: 0.6 },
    button: {
      width: 140,
      height: 22,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabs: {
      position: 'absolute',
      left: space.sm,
      right: space.sm,
      bottom: space.sm,
      height: 26,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
  });
