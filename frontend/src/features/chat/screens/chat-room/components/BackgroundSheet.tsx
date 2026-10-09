/**
 * Chọn nền khung chat — bảng trượt từ dưới, lưới ô xem trước (nền thật + hai
 * bong bóng mẫu) như Telegram. Chạm là đổi ngay; nền chỉ đổi ở phía MÌNH.
 */
import { memo } from 'react';
import { Modal, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHAT_BACKGROUNDS } from '@nook/shared/model/constant';
import type { TChatBackground } from '@nook/shared/model/type';
import { Icon, Tap, Txt } from '@ui';
import { radius, space, useColors, useStyles, type Palette } from '@design';
import { Wallpaper } from '../../../components/Wallpaper';

const COLS = 4;

export const BackgroundSheet = memo(function BackgroundSheet({
  visible,
  current,
  title,
  hint,
  names,
  closeLabel,
  onPick,
  onClose,
}: {
  visible: boolean;
  current: TChatBackground;
  title: string;
  hint: string;
  names: (k: TChatBackground) => string;
  closeLabel: string;
  onPick: (k: TChatBackground) => void;
  onClose: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const w = Math.floor((width - space.lg * 2 - space.sm * (COLS - 1)) / COLS);
  const h = Math.round(w * 1.5);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <Tap style={s.fill} onPress={onClose} scaleTo={1} feedback={null} accessibilityLabel={closeLabel} />
        <View style={[s.sheet, { paddingBottom: insets.bottom + space.lg }]}>
          <View style={s.grip} />
          <Txt variant="section">{title}</Txt>
          <Txt variant="faint" tone="muted">
            {hint}
          </Txt>
          <View style={s.grid}>
            {CHAT_BACKGROUNDS.map((k) => {
              const on = k === current;
              return (
                <Tap
                  key={k}
                  onPress={() => onPick(k)}
                  feedback="select"
                  scaleTo={0.95}
                  style={s.item}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={names(k)}
                >
                  <View style={[s.preview, { width: w, height: h }, on && s.previewOn]}>
                    <Wallpaper background={k} width={w} height={h} scale={0.5} />
                    <View style={[s.mini, s.miniTheirs]} />
                    <View style={[s.mini, s.miniMine]} />
                    {on ? (
                      <View style={s.check}>
                        <Icon name="check" size={14} color={c.onAccent} />
                      </View>
                    ) : null}
                  </View>
                  <Txt variant="faint" tone={on ? 'default' : 'muted'} numberOfLines={1}>
                    {names(k)}
                  </Txt>
                </Tap>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: c.scrimSoft, justifyContent: 'flex-end' },
    fill: { flex: 1 },
    sheet: {
      backgroundColor: c.bg,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: space.lg,
      paddingTop: space.sm,
      gap: space.xs,
    },
    grip: {
      alignSelf: 'center',
      width: 40,
      height: 5,
      borderRadius: radius.full,
      backgroundColor: c.border,
      marginBottom: space.sm,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
    item: { alignItems: 'center', gap: space.xs },
    preview: {
      borderRadius: radius.md,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    previewOn: { borderColor: c.accent },
    mini: { position: 'absolute', height: 12, borderRadius: 6 },
    miniTheirs: { left: 6, top: '38%', width: '55%', backgroundColor: c.glass },
    miniMine: { right: 6, top: '56%', width: '45%', backgroundColor: c.accent },
    check: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 22,
      height: 22,
      borderRadius: radius.full,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
