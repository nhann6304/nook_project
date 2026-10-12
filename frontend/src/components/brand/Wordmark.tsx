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
 *
 * MẶT CƯỜI CÓ BIỂU CẢM (12/10/2026, màn Đăng nhập + Nhập mã):
 *   `lookX/lookY`  mắt liếc theo chữ đang gõ (-1…1)
 *   `eyes`         'shut' nhắm khi gõ mật khẩu · 'peek' hé một mắt khi hiện mật khẩu
 *   `shake`        tăng số = lắc đầu + mếu (sai mật khẩu / sai mã)
 *   `cheer`        tăng số = nhún lên, cười tươi, tim sáng bừng (đúng mã)
 * Đếm bằng SỐ chứ không bằng cờ true/false: sai hai lần liền cùng một câu lỗi
 * vẫn lắc hai lần. Tất cả chạy trên luồng UI, chỉ transform + thuộc tính SVG.
 */
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
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
const AnimatedPath = Animated.createAnimatedComponent(Path);

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
/** Mắt liếc xa nhất (đơn vị viewBox) — vẫn nằm gọn trong chữ o. */
const LOOK_X = 5;
const LOOK_Y = 4;
/** Nhún + tim sáng xong sau chừng này — người gọi chờ rồi mới chuyển màn. */
export const WORDMARK_CHEER_MS = 420;

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
  /** Mắt liếc ngang: -1 trái · 0 giữa · 1 phải. */
  lookX?: number;
  /** Mắt liếc dọc: -1 lên · 0 giữa · 1 xuống. */
  lookY?: number;
  /** `shut` nhắm cả hai · `peek` nhắm trái, hé phải. */
  eyes?: 'open' | 'shut' | 'peek';
  /** Tăng số là lắc đầu một lần. */
  shake?: number;
  /** Tăng số là nhún + tim sáng một lần. */
  cheer?: number;
};

export const Wordmark = memo(function Wordmark({
  size = 34,
  mono = false,
  onPhoto = false,
  brandTone = false,
  blink = 'none',
  blinkDelay = 500,
  lookX = 0,
  lookY = 0,
  eyes = 'open',
  shake = 0,
  cheer = 0,
}: WordmarkProps) {
  const c = useColors();
  const width = (size * VB_W) / VB_H;
  const ink = brandTone ? brand.puff : onPhoto ? c.onPhotoText : c.text;
  /** Mắt + miệng khoét trên chữ o: màu tương phản với chữ. */
  const faceInk = brandTone ? brand.navy : onPhoto && c.light ? c.shadow : c.bg;
  const glow = brandTone ? brand.glow : mono ? ink : c.accentBright;
  const rim = brandTone ? brand.rim : mono ? ink : c.accent;
  const shade = c.shadow;
  const [left, right] = useBlink(blink, blinkDelay);
  const face = useFace({ size, lookX, lookY, eyes, shake, cheer });

  return (
    <Animated.View
      accessible
      accessibilityRole="header"
      accessibilityLabel="LOVO"
      collapsable={false}
      style={face.body}
    >
      <Svg width={width} height={size} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {/* bóng */}
        <Path d={L} stroke={shade} {...LINE} opacity={0.18} translateY={DROP} />
        <Path d={V} stroke={shade} {...LINE} opacity={0.18} translateY={DROP} />
        <Circle cx={O.cx} cy={O.cy + DROP} r={O.r} fill={shade} opacity={0.18} />
        {/* chữ */}
        <Path d={L} stroke={ink} {...LINE} />
        <Path d={V} stroke={ink} {...LINE} />
        <Circle cx={O.cx} cy={O.cy} r={O.r} fill={ink} />
        <Eye cx={O.cx - EYE_DX} open={left} lid={face.lidL} face={face} fill={faceInk} />
        <Eye cx={O.cx + EYE_DX} open={right} lid={face.lidR} face={face} fill={faceInk} />
        <AnimatedPath
          d={SMILE}
          animatedProps={face.mouth}
          stroke={faceInk}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
        />
        {/* tim kính phát sáng — sáng bừng khi `cheer` */}
        {brandTone ? <Path d={HEART} fill={brand.glass} /> : null}
        <AnimatedPath d={HEART} fill={glow} animatedProps={face.heartFill} />
        <AnimatedPath d={HEART} stroke={glow} fill="none" animatedProps={face.heartOuter} />
        <AnimatedPath d={HEART} stroke={glow} fill="none" animatedProps={face.heartMid} />
        <Path d={HEART} stroke={rim} strokeWidth={3.6} strokeLinejoin="round" fill="none" />
      </Svg>
    </Animated.View>
  );
});

/** Một mắt: elip co `ry` theo chớp × mí × nheo, tâm trượt theo hướng liếc. */
function Eye({
  cx,
  open,
  lid,
  face,
  fill,
}: {
  cx: number;
  open: SharedValue<number>;
  lid: SharedValue<number>;
  face: Face;
  fill: string;
}) {
  const { gx, gy, squint } = face;
  const props = useAnimatedProps(() => ({
    cx: cx + gx.value,
    cy: O.cy - EYE_DY + gy.value,
    ry: EYE_R * open.value * lid.value * squint.value,
  }));
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

type Face = ReturnType<typeof useFace>;

/** Mọi biểu cảm ngoài chớp mắt: liếc, nhắm, lắc đầu, nhún. */
function useFace({
  size,
  lookX,
  lookY,
  eyes,
  shake,
  cheer,
}: {
  size: number;
  lookX: number;
  lookY: number;
  eyes: 'open' | 'shut' | 'peek';
  shake: number;
  cheer: number;
}) {
  const gx = useSharedValue(0);
  const gy = useSharedValue(0);
  const lidL = useSharedValue(1);
  const lidR = useSharedValue(1);
  const squint = useSharedValue(1);
  const nudge = useSharedValue(0);
  const hop = useSharedValue(0);
  const pulse = useSharedValue(0);
  const worry = useSharedValue(0);

  useEffect(() => {
    const cfg = { duration: 180 };
    gx.set(withTiming(clamp(lookX) * LOOK_X, cfg));
    gy.set(withTiming(clamp(lookY) * LOOK_Y, cfg));
  }, [gx, gy, lookX, lookY]);

  useEffect(() => {
    const cfg = { duration: 160 };
    lidL.set(withTiming(eyes === 'open' ? 1 : SHUT, cfg));
    lidR.set(withTiming(eyes === 'shut' ? SHUT : 1, cfg));
  }, [eyes, lidL, lidR]);

  useEffect(() => {
    if (!shake) return;
    nudge.set(
      withSequence(
        withTiming(-1, { duration: 55 }),
        withTiming(1, { duration: 90 }),
        withTiming(-0.7, { duration: 90 }),
        withTiming(0.45, { duration: 90 }),
        withTiming(0, { duration: 80 }),
      ),
    );
    worry.set(
      withSequence(
        withTiming(1, { duration: 120 }),
        withDelay(520, withTiming(0, { duration: 260 })),
      ),
    );
    squint.set(
      withSequence(
        withTiming(0.55, { duration: 90 }),
        withDelay(300, withTiming(1, { duration: 200 })),
      ),
    );
  }, [nudge, shake, squint, worry]);

  useEffect(() => {
    if (!cheer) return;
    hop.set(withSequence(withTiming(1, { duration: 170 }), withTiming(0, { duration: 250 })));
    pulse.set(
      withSequence(
        withTiming(1, { duration: 170 }),
        withDelay(160, withTiming(0, { duration: 520 })),
      ),
    );
    // Cười híp mắt: nheo mạnh rồi mở lại.
    squint.set(
      withSequence(
        withTiming(0.3, { duration: 110 }),
        withDelay(280, withTiming(1, { duration: 200 })),
      ),
    );
  }, [cheer, hop, pulse, squint]);

  const body = useAnimatedStyle(() => ({
    transform: [
      { translateX: nudge.value * size * 0.12 },
      { translateY: -hop.value * size * 0.2 },
      { rotate: `${nudge.value * 3}deg` },
    ],
  }));
  // Miệng: điểm uốn kéo xuống khi cười tươi, lật lên thành mếu khi lắc đầu.
  const mouth = useAnimatedProps(() => ({
    d: `M240 76Q254 ${90 + pulse.value * 6 - worry.value * 18} 268 76`,
  }));
  const heartFill = useAnimatedProps(() => ({ fillOpacity: 0.22 + pulse.value * 0.45 }));
  const heartOuter = useAnimatedProps(() => ({
    strokeWidth: 14 + pulse.value * 10,
    strokeOpacity: 0.12 + pulse.value * 0.3,
  }));
  const heartMid = useAnimatedProps(() => ({
    strokeWidth: 8,
    strokeOpacity: 0.28 + pulse.value * 0.4,
  }));

  return { gx, gy, lidL, lidR, squint, body, mouth, heartFill, heartOuter, heartMid };
}

function clamp(v: number): number {
  return Math.max(-1, Math.min(1, v));
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
