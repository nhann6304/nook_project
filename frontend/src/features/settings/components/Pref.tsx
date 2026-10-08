/**
 * Mảnh dựng các trang Cài đặt (07/10/2026 — bản trải hết ra một màn bị chê
 * "khó nhìn, khó chỉnh"):
 *
 *   NavRow    — hàng ở màn Cài đặt chính: icon · tên · giá trị đang chọn · ›
 *   ChoiceRow — một lựa chọn trong trang con: tên · gợi ý · nút tròn ✓
 *   PrefPage  — khung trang con: thanh trên có nút quay lại, nội dung cuộn,
 *               nút "Lưu" dính đáy. Chưa đổi gì thì nút mờ.
 *
 * Trang con giữ BẢN NHÁP: chạm chỉ đổi bản nháp (và bản xem trước), bấm Lưu
 * mới áp dụng và mới gửi server MỘT lần.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Icon,
  IconBadge,
  Screen,
  Scroll,
  Tap,
  TopBar,
  Txt,
  type IconName,
} from '@ui';
import { layout, radius, space, useColors, useStyles, type Palette } from '@design';

export const NavRow = memo(function NavRow({
  icon,
  title,
  value,
  onPress,
  danger,
}: {
  icon: IconName;
  title: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <Tap
      onPress={onPress}
      scaleTo={0.99}
      style={s.nav}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <IconBadge name={icon} danger={danger} />
      <View style={s.navText}>
        <Txt variant="label" tone={danger ? 'danger' : 'default'}>
          {title}
        </Txt>
        {value ? (
          <Txt variant="faint" tone="muted" numberOfLines={1}>
            {value}
          </Txt>
        ) : null}
      </View>
      {danger ? null : <Icon name="forward" size={18} color={c.textFaint} />}
    </Tap>
  );
});

export const ChoiceRow = memo(function ChoiceRow({
  title,
  hint,
  selected,
  onPress,
}: {
  title: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <Tap
      onPress={onPress}
      feedback="select"
      scaleTo={0.99}
      style={[s.choice, selected && s.choiceOn]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
    >
      <View style={s.navText}>
        <Txt variant="label">{title}</Txt>
        {hint ? (
          <Txt variant="faint" tone="muted">
            {hint}
          </Txt>
        ) : null}
      </View>
      <View style={[s.radio, selected && s.radioOn]}>
        {selected ? <Icon name="check" size={14} color={c.onAccent} /> : null}
      </View>
    </Tap>
  );
});

export function PrefPage({
  title,
  backLabel,
  onBack,
  saveLabel,
  onSave,
  dirty,
  saving,
  error,
  children,
}: {
  title: string;
  backLabel: string;
  onBack: () => void;
  saveLabel: string;
  onSave: () => void;
  /** Có gì khác bản đang dùng — không thì nút Lưu mờ. */
  dirty: boolean;
  saving: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  const s = useStyles(make);
  return (
    <Screen>
      <TopBar title={title} closeLabel={backLabel} onClose={onBack} />
      <Scroll>
        <View style={s.body}>{children}</View>
      </Scroll>
      <View style={s.footer}>
        {error ? <HelperText tone="danger">{error}</HelperText> : null}
        <Button
          label={saveLabel}
          variant="primary"
          onPress={onSave}
          disabled={!dirty}
          loading={saving}
          block
        />
      </View>
    </Screen>
  );
}

/** Tiêu đề nhỏ giữa các nhóm trong trang con. */
export function PrefSection({ title, children }: { title: string; children: React.ReactNode }) {
  const s = useStyles(make);
  return (
    <View style={s.section}>
      <Txt variant="label" tone="muted" style={s.sectionTitle}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      minHeight: layout.minTouch + space.md,
      paddingVertical: space.sm,
    },
    navText: { flex: 1, gap: 2 },
    choice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      padding: space.lg,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.bg,
    },
    choiceOn: { borderColor: c.accent, backgroundColor: c.accentSoft },
    radio: {
      width: 26,
      height: 26,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOn: { backgroundColor: c.accent, borderColor: c.accent },
    body: {
      paddingTop: space.md,
      paddingBottom: space.xxl,
      gap: space.xl,
      maxWidth: layout.maxTextWidth,
      width: '100%',
      alignSelf: 'center',
    },
    section: { gap: space.sm },
    sectionTitle: { paddingHorizontal: space.xs },
    footer: { gap: space.sm, paddingTop: space.sm, paddingBottom: space.sm },
  });
