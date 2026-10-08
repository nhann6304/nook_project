/**
 * Button — nút KHỐI NỔI (08/10/2026, nhánh thử giao diện).
 *
 * Nút phẳng bị chê "nhìn sao sao". Bản này có một gờ đậm hơn ở đáy; nhấn thì
 * mặt nút LÚN XUỐNG phủ kín gờ — ngón tay thấy mình vừa ấn một thứ thật. Lún
 * chạy trên luồng UI (Reanimated), JS kẹt nút vẫn lún.
 *
 *   primary   mặt màu nhấn, gờ màu nhấn đậm. MỖI MÀN CHỈ MỘT CÁI.
 *   secondary mặt kính, viền + gờ màu đường kẻ. Việc quan trọng thứ hai.
 *   ghost     phẳng, không gờ. Việc phụ, huỷ, bỏ qua.
 *   danger    mặt kính, viền + gờ đỏ. Xoá, rời góc.
 */
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { font, layout, radius, space, useColors, useStyles, type Palette } from '@design';
import { Txt } from './Txt';
import { Tap, type TapProps } from './Tap';
import { Spinner } from '../feedback/Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = Omit<TapProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  /** Icon đặt trước chữ. Truyền phần tử icon, không truyền tên. */
  icon?: React.ReactNode;
  /** Kéo dài hết bề ngang cha. */
  block?: boolean;
  /** Nút PHẲNG bình thường, không gờ, không lún — cho nút nhỏ nằm trong thẻ. */
  flat?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Độ dày gờ đáy — cũng là quãng mặt nút lún xuống. */
const EDGE = 4;
const PRESS_MS = 70;

export function Button({
  label,
  variant = 'primary',
  loading = false,
  icon,
  block = false,
  flat = false,
  disabled,
  style,
  feedback = variant === 'primary' ? 'confirm' : 'tap',
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const s = useStyles(make);
  const c = useColors();
  const off = disabled === true || loading;
  const raised = variant !== 'ghost' && !off && !flat;
  const pressed = useSharedValue(0);

  const face = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * EDGE }],
  }));

  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      feedback={off ? null : feedback}
      scaleTo={1}
      onPressIn={(e) => {
        pressed.set(withTiming(1, { duration: PRESS_MS }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.set(withTiming(0, { duration: PRESS_MS * 2 }));
        onPressOut?.(e);
      }}
      style={[s.wrap, block && s.block, flat && s.flatWrap, off && s.off, style]}
      {...rest}
    >
      {raised ? <View style={[s.edge, s[EDGE_STYLE[variant]]]} /> : null}
      <Animated.View style={[s.face, s[variant], raised && face]}>
        {loading ? (
          <Spinner size={20} color={variant === 'primary' ? c.onAccent : c.text} />
        ) : (
          <View style={s.content}>
            {icon}
            <Txt variant="label" tone={TONE[variant]} style={s.label} numberOfLines={1}>
              {label}
            </Txt>
          </View>
        )}
      </Animated.View>
    </Tap>
  );
}

const TONE = {
  primary: 'onAccent',
  secondary: 'default',
  ghost: 'muted',
  danger: 'danger',
} as const;

const EDGE_STYLE = {
  primary: 'edgePrimary',
  secondary: 'edgeSecondary',
  danger: 'edgeDanger',
} as const;

const make = (c: Palette) =>
  StyleSheet.create({
    wrap: { paddingBottom: EDGE },
    block: { alignSelf: 'stretch' },
    flatWrap: { paddingBottom: 0 },
    edge: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: EDGE,
      bottom: 0,
      borderRadius: radius.lg,
    },
    edgePrimary: { backgroundColor: c.accentDeep },
    edgeSecondary: { backgroundColor: c.border },
    edgeDanger: { backgroundColor: c.danger },
    face: {
      minHeight: layout.controlHeight,
      borderRadius: radius.lg,
      paddingHorizontal: space.xxl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: c.accent },
    secondary: { borderWidth: 2, borderColor: c.border, backgroundColor: c.glass },
    ghost: { backgroundColor: 'transparent' },
    danger: { borderWidth: 2, borderColor: c.danger, backgroundColor: c.glass },

    off: { opacity: 0.4 },

    content: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    label: { fontSize: 16, fontFamily: font.bodyBold },
  });
