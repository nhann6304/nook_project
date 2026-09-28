/**
 * Màn Chào mừng — theo bảng thiết kế A01: một tấm ảnh THẬT tràn nửa trên, mờ
 * dần vào nền; một thẻ thông báo "Linh vừa gửi" nói Nook làm gì bằng hình
 * thay vì bằng chữ; tiêu đề đậm căn trái.
 *
 * Bỏ vầng sáng và chồng khung đứt nét của bản trước: chúng làm màn trông như
 * minh hoạ, không giống app chụp ảnh.
 */
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button, Img, Screen, Txt, Wordmark } from '@ui';
import {
  duration,
  layout,
  radius,
  space,
  spring,
  useColors,
  useStyles,
  type Palette,
} from '@design';
import { useT } from '@i18n';
import { SEED_MOMENTS } from '@/mocks/moments';

const HERO = SEED_MOMENTS[0]!;
const STAGGER = 90;

export function WelcomeScreen({
  onCreate,
  onSignIn,
}: {
  onCreate: () => void;
  onSignIn: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const { height } = useWindowDimensions();
  const heroH = Math.round(height * 0.66);

  const rise = (i: number) =>
    FadeInDown.delay(duration.slow + i * STAGGER)
      .springify()
      .damping(spring.enter.damping)
      .stiffness(spring.enter.stiffness);

  return (
    <View style={s.root}>
      <Animated.View entering={FadeIn.duration(duration.scene)} style={[s.hero, { height: heroH }]}>
        <Img source={HERO.photo} style={s.fill} transition={0} />
        <LinearGradient
          colors={[c.scrimSoft, 'transparent', 'transparent', c.bg]}
          locations={GRADIENT_STOPS}
          style={s.fill}
        />
      </Animated.View>

      <Screen clear>
        <View style={s.top}>
          <Wordmark size={32} />
        </View>

        <Animated.View
          entering={FadeInUp.delay(duration.scene).springify().damping(spring.enter.damping)}
          style={s.notice}
        >
          <Img source={SEED_MOMENTS[1]!.photo} style={s.noticeThumb} transition={0} />
          <View>
            <Txt variant="label" tone="onPhoto">
              {t('welcome.notifyTitle', { name: HERO.author.name })}
            </Txt>
            <Txt variant="faint" tone="onPhoto">
              {t('welcome.notifySub')}
            </Txt>
          </View>
        </Animated.View>

        <View style={s.flex} />

        <View style={s.words}>
          <Animated.View entering={rise(0)}>
            <Txt variant="display">{t('welcome.headline')}</Txt>
          </Animated.View>
          <Animated.View entering={rise(1)}>
            <Txt variant="body" tone="muted">
              {t('welcome.sub')}
            </Txt>
          </Animated.View>
        </View>

        <Animated.View entering={rise(2)} style={s.actions}>
          <Button label={t('welcome.create')} onPress={onCreate} block />
          <Button label={t('welcome.signIn')} variant="ghost" onPress={onSignIn} block />
        </Animated.View>
      </Screen>
    </View>
  );
}

const GRADIENT_STOPS = [0, 0.22, 0.55, 0.97] as const;

const make = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    fill: StyleSheet.absoluteFill,
    hero: { position: 'absolute', left: 0, right: 0, top: 0 },
    top: { alignItems: 'center', paddingTop: space.sm },
    notice: {
      alignSelf: 'center',
      marginTop: space.huge * 3,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      padding: space.md,
      paddingRight: space.xl,
      borderRadius: radius.lg,
      backgroundColor: c.onPhoto,
      borderWidth: 1,
      borderColor: c.hairlineOnPhoto,
    },
    noticeThumb: { width: 44, height: 44, borderRadius: radius.sm },
    flex: { flex: 1 },
    words: { gap: space.sm + 2, maxWidth: layout.maxTextWidth },
    actions: { paddingTop: space.xxl + 4, paddingBottom: space.sm, gap: space.xs },
  });
