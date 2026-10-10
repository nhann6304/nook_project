/**
 * Wordmark — "LOVO" (bản 07/10/2026 theo logo mẫu): chữ PHỒNG nét dày bo
 * tròn, chữ O đầu là TRÁI TIM KÍNH phát sáng, chữ "o" cuối là MẶT CƯỜI.
 * Vẽ bằng hình chứ không gõ phông: phông tải hụt thì tên thương hiệu không
 * được phép rơi về phông hệ thống.
 *
 * Phát sáng bằng ba nét chồng nhau (rộng → hẹp, mờ → rõ), KHÔNG dùng bộ lọc
 * blur của SVG — Android vẽ lại bộ lọc mỗi khung hình. Icon app thì dùng blur
 * thật, vì nó là ảnh tĩnh (`scripts/brand-icons.mjs`).
 *
 * Hình học: viewBox 300×130. Đổi số ở đây thì đổi cả `scripts/brand-icons.mjs`.
 *
 * MẶT CƯỜI BIẾT CHỚP MẮT (10/10/2026): `blink="wink"` nháy một mắt đúng một
 * lần (splash); `blink="loop"` nháy mắt chào rồi thỉnh thoảng chớp đôi (màn
 * Chào mừng, Giới thiệu). Chỉ co `ry` của hai elip trên luồng UI — không vẽ
 * lại cả hình. Máy bật "Giảm chuyển động" thì Reanimated tự bỏ qua.
 */
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { brand, space, useColors, useStyles } from '@design';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const VB_W = 300;
const VB_H = 130;
const STROKE = 26;

const L = 'M34 28V92H70';
const V = 'M168 50L186 94L204 50';
export const HEART =
  'M117 101C93 86 82 72 82 56C82 42 92 33 104 33C110 33 115 37 117 42C119 37 124 33 130 33C142 33 152 42 152 56C152 72 141 86 117 101Z';
const O = { cx: 254, cy: 70, r: 33 } as const;
const SMILE = 'M240 76Q254 90 268 76';
const EYE_R = 4.6;
const EYE_DX = 11;
const EYE_DY = 7;
/** Bóng chữ lệch xuống — cho cảm giác phồng mà không cần bộ lọc. */
const DROP = 4;

export type WordmarkProps = {
  /** Chiều CAO. Bề ngang tự tính theo — không kéo méo được. */
  size?: number;
  /** Một màu — dùng khi in một màu. */
  mono?: boolean;
  /** Nằm trên ảnh: chữ trắng như icon app, không theo màu chữ của cảnh. */
  onPhoto?: boolean;
  /** Màu icon app (chữ trắng, mắt navy) — cho lớp splash, không theo bảng màu. */
  brandTone?: boolean;
  /** `wink` nháy một mắt một lần · `loop` nháy chào rồi chớp đôi mỗi vài giây. */
  blink?: 'none' | 'wink' | 'loop';
  /** Nháy mắt bắt đầu sau bao lâu (ms). */
  blinkDelay?: number;
};

export const Wordmark = memo(function Wordmark({
  size = 34,
  mono = false,
  onPhoto = false,
  brandTone = false,
  blink = 'none',
  blinkDelay = 500,
}: WordmarkProps) {
  const c = useColors();
  const width = (size * VB_W) / VB_H;
  const ink = brandTone ? brand.puff : onPhoto ? c.onPhotoText : c.text;
  /** Mắt + miệng khoét trên chữ o: màu tương phản với chữ. */
  const face = brandTone ? brand.navy : onPhoto && c.light ? c.shadow : c.bg;
  const glow = brandTone ? brand.glow : mono ? ink : c.accentBright;
  const rim = brandTone ? brand.rim : mono ? ink : c.accent;
  const shade = c.shadow;
  const [left, right] = useBlink(blink, blinkDelay);

  return (
    <View accessible accessibilityRole="header" accessibilityLabel="LOVO" collapsable={false}>
      <Svg width={width} height={size} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {/* bóng */}
        <Path d={L} stroke={shade} {...LINE} opacity={0.18} translateY={DROP} />
        <Path d={V} stroke={shade} {...LINE} opacity={0.18} translateY={DROP} />
        <Circle cx={O.cx} cy={O.cy + DROP} r={O.r} fill={shade} opacity={0.18} />
        {/* chữ */}
        <Path d={L} stroke={ink} {...LINE} />
        <Path d={V} stroke={ink} {...LINE} />
        <Circle cx={O.cx} cy={O.cy} r={O.r} fill={ink} />
        <Eye cx={O.cx - EYE_DX} open={left} fill={face} />
        <Eye cx={O.cx + EYE_DX} open={right} fill={face} />
        <Path d={SMILE} stroke={face} strokeWidth={6} strokeLinecap="round" fill="none" />
        {/* tim kính phát sáng */}
        {brandTone ? <Path d={HEART} fill={brand.glass} /> : null}
        <Path d={HEART} fill={glow} fillOpacity={0.22} />
        <Path d={HEART} stroke={glow} strokeWidth={14} strokeOpacity={0.12} fill="none" />
        <Path d={HEART} stroke={glow} strokeWidth={8} strokeOpacity={0.28} fill="none" />
        <Path d={HEART} stroke={rim} strokeWidth={3.6} strokeLinejoin="round" fill="none" />
      </Svg>
    </View>
  );
});

/** Một mắt: elip co `ry` theo `open` (1 mở · ~0 nhắm). */
function Eye({ cx, open, fill }: { cx: number; open: SharedValue<number>; fill: string }) {
  const props = useAnimatedProps(() => ({ ry: EYE_R * open.value }));
  return (
    <AnimatedEllipse
      cx={cx}
      cy={O.cy - EYE_DY}
      rx={EYE_R}
      ry={EYE_R}
      fill={fill}
      animatedProps={props}
    />
  );
}

const SHUT = 0.12;
/** Nhắm nhanh, giữ `hold`, mở chậm hơn một chút — chớp thật trông như vậy. */
const shut = (hold: number) =>
  withSequence(
    withTiming(SHUT, { duration: 80 }),
    withDelay(hold, withTiming(1, { duration: 140 })),
  );
/** Nháy một mắt: giữ lâu hơn chớp thường để nhìn ra là CỐ Ý. */
const WINK_HOLD = 180;
const WINK_MS = 80 + WINK_HOLD + 140;
/** Chớp đôi, nghỉ vài giây, lặp mãi. */
const blinkLoop = () =>
  withRepeat(withSequence(withDelay(3200, shut(30)), withDelay(110, shut(30))), -1);

function useBlink(mode: 'none' | 'wink' | 'loop', delay: number) {
  const left = useSharedValue(1);
  const right = useSharedValue(1);
  useEffect(() => {
    if (mode === 'none') return;
    right.set(
      mode === 'wink'
        ? withDelay(delay, shut(WINK_HOLD))
        : withSequence(withDelay(delay, shut(WINK_HOLD)), blinkLoop()),
    );
    if (mode === 'loop') left.set(withDelay(delay + WINK_MS, blinkLoop()));
    return () => {
      cancelAnimation(left);
      cancelAnimation(right);
    };
  }, [delay, left, mode, right]);
  return [left, right] as const;
}

/** Nét chung. Bo tròn hai đầu — cùng giọng với bộ icon. */
const LINE = {
  strokeWidth: STROKE,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

/** Dấu hiệu + chữ nằm ngang. Chỉ dùng ở màn Chào mừng. */
export function Lockup({ children }: { children?: React.ReactNode }) {
  const s = useStyles(make);
  return <View style={s.lockup}>{children}</View>;
}

const make = () =>
  StyleSheet.create({
    lockup: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  });
