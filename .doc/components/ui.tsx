/**
 * Nook — bộ component lõi.
 * Mọi màn hình chỉ được lắp từ những mảnh ở đây.
 * Ưu tiên: dễ xài > đẹp. Vùng chạm đủ lớn, nhãn accessibility đầy đủ,
 * trạng thái nhấn rõ ràng, chữ phóng to được.
 */
import React from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, View,
  type PressableProps, type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { color, layout, radius, ringColor, space, type } from '../theme/tokens';

/* ---------- Screen ---------- */

export function Screen({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      <View style={padded ? { flex: 1, paddingHorizontal: layout.screenPadding } : { flex: 1 }}>
        {children}
      </View>
    </SafeAreaView>
  );
}

/* ---------- Chữ ---------- */

type TxtVariant = keyof typeof type;

export function Txt({
  variant = 'body', muted, faint, style, children, ...rest
}: {
  variant?: TxtVariant; muted?: boolean; faint?: boolean;
  style?: StyleProp<TextStyle>; children: React.ReactNode;
} & React.ComponentProps<typeof Text>) {
  const t = type[variant];
  return (
    <Text
      maxFontSizeMultiplier={t.maxScale}
      style={[
        { fontSize: t.fontSize, fontWeight: t.fontWeight,
          color: faint ? color.textFaint : muted ? color.textMuted : color.text },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/* ---------- Button ---------- */

export function Button({
  label, onPress, variant = 'primary', loading, disabled, style, ...rest
}: {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
} & PressableProps) {
  const off = disabled || loading;
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={({ pressed }) => [
        s.btn,
        primary
          ? { backgroundColor: pressed ? color.accentPressed : color.accent }
          : { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: color.border,
              backgroundColor: pressed ? color.surface : 'transparent' },
        off && { opacity: 0.45 },
        style,
      ]}
      {...rest}
    >
      {loading
        ? <ActivityIndicator color={primary ? color.bg : color.text} />
        : <Text
            maxFontSizeMultiplier={1.3}
            style={[s.btnLabel, { color: primary ? color.bg : color.text }]}
          >
            {label}
          </Text>}
    </Pressable>
  );
}

/** Nút icon — luôn giữ vùng chạm 48pt dù icon nhỏ. */
export function IconButton({
  children, label, onPress, ...rest
}: { children: React.ReactNode; label: string } & PressableProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.6 }]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

/* ---------- Bề mặt ---------- */

export function Pill({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  const inner = <View style={s.pill}>{children}</View>;
  if (!onPress) return inner;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={6}
      style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {inner}
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statCard} accessible accessibilityLabel={`${label}: ${value}`}>
      <Txt variant="label" muted>{label}</Txt>
      <Txt variant="stat" style={{ marginTop: space.xs }}>{value}</Txt>
    </View>
  );
}

/* ---------- Avatar ---------- */

export function Avatar({
  size = 56, level = 1, dormant, uri, name, onPress,
}: {
  size?: number; level?: number; dormant?: boolean;
  uri?: string; name: string; onPress?: () => void;
}) {
  const border = dormant
    ? { borderColor: color.border, borderStyle: 'dashed' as const }
    : { borderColor: ringColor(level) };

  const circle = (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, borderWidth: 2.5,
          backgroundColor: dormant ? color.surfaceSunken : color.surface,
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
        border,
      ]}
    >
      {uri
        ? <View style={StyleSheet.absoluteFill} /* thay bằng <Image source={{uri}} /> */ />
        : <Txt variant="section" muted>{name.charAt(0).toUpperCase()}</Txt>}
    </View>
  );

  if (!onPress) return circle;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dormant ? `${name}, đang ngủ đông` : `${name}, cấp ${level}`}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      {circle}
    </Pressable>
  );
}

/* ---------- Empty state ---------- */

/** Màn trống luôn là một lời mời hành động, không bao giờ chỉ có chữ. */
export function EmptyState({
  message, actionLabel, onAction, art,
}: { message: string; actionLabel?: string; onAction?: () => void; art?: React.ReactNode }) {
  return (
    <View style={s.empty}>
      {art}
      <Txt variant="body" muted style={{ textAlign: 'center', marginTop: space.lg }}>
        {message}
      </Txt>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: space.xl, minWidth: 180 }} />
      )}
    </View>
  );
}

/* ---------- Styles ---------- */

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },

  btn: {
    minHeight: layout.minTouch,
    borderRadius: radius.xl,
    paddingHorizontal: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: { fontSize: 15, fontWeight: '500' },

  iconBtn: {
    width: layout.minTouch,
    height: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pill: {
    backgroundColor: color.surface,
    borderRadius: radius.full,
    paddingHorizontal: space.lg,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.lg,
  },

  statCard: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: radius.sm,
    padding: space.md,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xxl,
  },
});
