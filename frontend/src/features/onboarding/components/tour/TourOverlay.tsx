/**
 * Tour chỉ nút — lớp phủ tối có một ĐỐM SÁNG khoét đúng hình nút đang giới
 * thiệu, thẻ chú thích có mũi nhọn chỉ vào nó. Đốm trượt mượt từ nút này sang
 * nút kia (đường `d` của SVG chạy trên luồng UI), thẻ mờ vào theo bước.
 *
 * Chạm bất kỳ đâu = bước tiếp. "Bỏ qua" tắt hẳn và nhớ là đã xem. Nút quay lại
 * của Android cũng tắt. Nút nào không có trên màn thì nhảy qua.
 *
 * Đặt ở `app/(app)/_layout.tsx`, phủ cả thanh tab.
 */
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Button, Tap, Txt } from '@ui';
import { duration, ease, radius, space, useColors, useStyles, type Palette } from '@design';
import { useT } from '@i18n';
import * as feel from '@/lib/device/haptics';
import { useOnboarding } from '../../store/onboardingStore';
import { measureTourTarget, type TourRect } from '../../hooks/useTourTarget';
import { TOUR_COPY, TOUR_TARGETS, type TourTargetId } from '../../utils/tourSteps';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const PAD = 6;
const GAP = 14;
const ARROW = 14;
const CARD_MAX = 340;
/** Chờ màn trượt xong (vừa đóng trang cá nhân, vừa vào app) rồi mới đo. */
const SETTLE_MS = 450;
const OUT = Easing.bezier(...ease.out);

type Step = { id: TourTargetId; rect: TourRect };

export function TourOverlay() {
  const touring = useOnboarding((s) => s.touring);
  if (!touring) return null;
  return <Tour />;
}

function Tour() {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const { width: W, height: H } = useWindowDimensions();
  const finishTour = useOnboarding((st) => st.finishTour);
  const [steps, setSteps] = useState<readonly Step[] | null>(null);
  const [index, setIndex] = useState(0);

  // Đo MỘT lượt mọi nút sau khi màn đứng yên; nút vắng mặt bị loại.
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      void Promise.all(
        TOUR_TARGETS.map(async (id) => ({ id, rect: await measureTourTarget(id) })),
      ).then((all) => {
        if (!alive) return;
        const found = all.filter((x): x is Step => x.rect !== null);
        if (found.length === 0) finishTour();
        else setSteps(found);
      });
    }, SETTLE_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [finishTour]);

  /* ── Đốm sáng: năm số trượt cùng nhau ── */
  const hx = useSharedValue(W / 2);
  const hy = useSharedValue(H / 2);
  const hw = useSharedValue(0);
  const hh = useSharedValue(0);
  const hr = useSharedValue(0);
  const step = steps?.[index];

  useEffect(() => {
    if (!step) return;
    const { x, y, w, h } = step.rect;
    const box = { x: x - PAD, y: y - PAD, w: w + PAD * 2, h: h + PAD * 2 };
    // Nút gần vuông → đốm tròn; nút dài (viên thuốc) → bo theo chiều cao.
    const round =
      Math.abs(box.w - box.h) < 12 ? Math.min(box.w, box.h) / 2 : Math.min(box.h / 2, radius.xl);
    const cfg = { duration: duration.slow, easing: OUT };
    hx.set(withTiming(box.x, cfg));
    hy.set(withTiming(box.y, cfg));
    hw.set(withTiming(box.w, cfg));
    hh.set(withTiming(box.h, cfg));
    hr.set(withTiming(round, cfg));
  }, [hh, hr, hw, hx, hy, step]);

  const hole = useAnimatedProps(() => ({
    d: roundRect(hx.value, hy.value, hw.value, hh.value, hr.value),
  }));
  const dim = useAnimatedProps(() => ({
    d: `M0 0H${W}V${H}H0Z ${roundRect(hx.value, hy.value, hw.value, hh.value, hr.value)}`,
  }));

  const total = steps?.length ?? 0;
  const last = index >= total - 1;
  const next = useCallback(() => {
    feel.tap();
    if (last) finishTour();
    else setIndex((i) => i + 1);
  }, [finishTour, last]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      finishTour();
      return true;
    });
    return () => sub.remove();
  }, [finishTour]);

  /* ── Thẻ chú thích: dưới nút nếu nút ở nửa trên, trên nút nếu ở nửa dưới ── */
  const card = step ? place(step.rect, W, H) : null;
  const copy = step ? TOUR_COPY[step.id] : null;

  return (
    <Animated.View
      entering={FadeIn.duration(duration.base)}
      exiting={FadeOut.duration(duration.fast)}
      style={s.root}
    >
      <Tap
        onPress={next}
        feedback={null}
        scaleTo={1}
        style={StyleSheet.absoluteFill}
        accessibilityLabel={t('tour.next')}
      >
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <AnimatedPath animatedProps={dim} fill={c.scrim} fillRule="evenodd" />
          <AnimatedPath animatedProps={hole} fill="none" stroke={c.onPhotoText} strokeWidth={2} />
        </Svg>
      </Tap>

      {step && card && copy ? (
        <Animated.View
          key={step.id}
          entering={FadeIn.delay(duration.fast).duration(duration.base)}
          pointerEvents="box-none"
          style={[
            s.card,
            { left: card.left, width: card.width },
            card.below ? { top: card.edge } : { bottom: card.edge },
          ]}
        >
          <View
            style={[
              s.arrow,
              { left: card.arrowX - ARROW / 2 },
              card.below ? s.arrowTop : s.arrowBottom,
            ]}
          />
          <View style={s.head}>
            <Txt variant="section" style={s.title}>
              {t(copy.title)}
            </Txt>
            <Txt variant="faint" tone="muted">
              {t('tour.step', { index: index + 1, total })}
            </Txt>
          </View>
          <Txt variant="body" tone="muted">
            {t(copy.body)}
          </Txt>
          <View style={s.actions}>
            {last ? (
              <View />
            ) : (
              <Tap onPress={finishTour} style={s.skip} accessibilityLabel={t('tour.skip')}>
                <Txt variant="label" tone="muted">
                  {t('tour.skip')}
                </Txt>
              </Tap>
            )}
            <Button label={last ? t('tour.done') : t('tour.next')} onPress={next} flat />
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

/** Hình chữ nhật bo góc làm đường SVG — chạy được trên luồng UI. */
function roundRect(x: number, y: number, w: number, h: number, r: number): string {
  'worklet';
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  return (
    `M${x + k} ${y}H${x + w - k}A${k} ${k} 0 0 1 ${x + w} ${y + k}` +
    `V${y + h - k}A${k} ${k} 0 0 1 ${x + w - k} ${y + h}` +
    `H${x + k}A${k} ${k} 0 0 1 ${x} ${y + h - k}` +
    `V${y + k}A${k} ${k} 0 0 1 ${x + k} ${y}Z`
  );
}

function place(r: TourRect, W: number, H: number) {
  const width = Math.min(W - space.lg * 2, CARD_MAX);
  const cx = r.x + r.w / 2;
  const left = Math.min(Math.max(space.lg, cx - width / 2), W - space.lg - width);
  const below = r.y + r.h / 2 < H / 2;
  const edge = below ? r.y + r.h + PAD + GAP : H - r.y + PAD + GAP;
  // Mũi nhọn chỉ đúng tâm nút, nhưng không trượt ra khỏi góc bo của thẻ.
  const arrowX = Math.min(Math.max(cx - left, radius.xl), width - radius.xl);
  return { left, width, below, edge, arrowX };
}

const make = (c: Palette) =>
  StyleSheet.create({
    root: { ...StyleSheet.absoluteFill, zIndex: 50 },
    card: {
      position: 'absolute',
      gap: space.sm,
      padding: space.lg,
      borderRadius: radius.xl,
      borderCurve: 'continuous',
      backgroundColor: c.surface,
    },
    arrow: {
      position: 'absolute',
      width: ARROW,
      height: ARROW,
      backgroundColor: c.surface,
      transform: [{ rotate: '45deg' }],
    },
    arrowTop: { top: -ARROW / 2 + 1 },
    arrowBottom: { bottom: -ARROW / 2 + 1 },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space.md,
    },
    title: { flex: 1 },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: space.xs,
    },
    skip: { minHeight: 44, justifyContent: 'center', paddingRight: space.md },
  });
