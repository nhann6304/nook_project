/**
 * Button — nút bấm. Bốn dáng, không hơn.
 *
 *   primary   dải màu, chữ tối. MỖI MÀN CHỈ MỘT CÁI. Đây là luật, không phải gợi ý.
 *   secondary viền mảnh, nền trong. Việc quan trọng thứ hai.
 *   ghost     không viền không nền. Việc phụ, huỷ, bỏ qua.
 *   danger    viền đỏ. Xoá, rời góc.
 *
 * Chữ trên nút primary là màu TỐI (#1A0E08), không phải trắng. Số đo trên ba
 * chặng của dải: chữ tối cho 8.37 / 6.85 / 6.47:1, chữ trắng chỉ 2.26 / 2.76 /
 * 2.92:1 — trượt chuẩn ở mọi chặng. Xem `color.onAccent` trong tokens.
 */
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, elevation, gradient, layout, radius, space } from '@design';
import { Txt } from './Txt';
import { Tap, type TapProps } from './Tap';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = Omit<TapProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  /** Icon đặt trước chữ. Truyền phần tử icon, không truyền tên. */
  icon?: React.ReactNode;
  /** Kéo dài hết bề ngang cha. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  icon,
  block = false,
  disabled,
  style,
  feedback = variant === 'primary' ? 'confirm' : 'tap',
  ...rest
}: ButtonProps) {
  const off = disabled === true || loading;
  const primary = variant === 'primary';

  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      feedback={off ? null : feedback}
      scaleTo={0.965}
      style={[
        s.base,
        block && s.block,
        primary ? s.primary : s[variant],
        off && s.off,
        style,
      ]}
      {...rest}
    >
      {/* Dải màu là lớp nền, nằm dưới chữ. Nút một màu phẳng trên nền gần đen
          trông như miếng dán; dải màu làm nó trông có ánh sáng chiếu vào. */}
      {primary ? (
        <LinearGradient
          colors={gradient.warm}
          start={gradient.start}
          end={gradient.end}
          style={s.fill}
          pointerEvents="none"
        />
      ) : null}

      {loading ? (
        <ActivityIndicator color={primary ? color.onAccent : color.text} />
      ) : (
        <View style={s.content}>
          {icon}
          <Txt variant="label" tone={TONE[variant]} style={s.label} numberOfLines={1}>
            {label}
          </Txt>
        </View>
      )}
    </Tap>
  );
}

const TONE = {
  primary: 'onAccent',
  secondary: 'default',
  ghost: 'muted',
  danger: 'danger',
} as const;

const s = StyleSheet.create({
  base: {
    minHeight: layout.controlHeight,
    borderRadius: radius.xl,
    paddingHorizontal: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    // overflow hidden để dải màu bị cắt theo góc bo
    overflow: 'hidden',
  },
  block: { alignSelf: 'stretch' },
  fill: StyleSheet.absoluteFill,

  primary: { backgroundColor: color.accent, ...elevation.glowAccent },
  secondary: { borderWidth: 1, borderColor: color.border, backgroundColor: color.surface },
  ghost: { backgroundColor: 'transparent' },
  danger: { borderWidth: 1, borderColor: color.danger, backgroundColor: 'transparent' },

  off: { opacity: 0.4, ...elevation.none },

  content: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { fontSize: 15 },
});
