/**
 * Màn Giới thiệu — chỉ ở LẦN MỞ ĐẦU TIÊN, trước màn Chào mừng.
 *
 * Ba trang vuốt ngang: chụp gửi ngay · mười người thân · ký ức. "Bỏ qua" góc
 * phải lúc nào cũng bấm được; nút dưới đáy "Tiếp" → trang cuối thành "Bắt đầu
 * thôi". Logo trên đầu nháy mắt chào.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button, Screen, SkyWash, Slides, Tap, Txt, Wordmark, type SlidesHandle } from '@ui';
import { duration, layout, radius, space, useStyles, type Palette } from '@design';
import { useDate, useT } from '@i18n';
import { INTRO_FRIENDS } from '@/mocks/intro';
import { CircleArt, MemoryArt, SnapArt } from './components/IntroArt';

export function IntroScreen({ onDone }: { onDone: () => void }) {
  const s = useStyles(make);
  const t = useT();
  const date = useDate();
  const { width, height } = useWindowDimensions();
  const slides = useRef<SlidesHandle>(null);
  const [index, setIndex] = useState(0);
  const art = Math.min(width - space.xxl * 2, height * 0.42);

  const pages = useMemo(
    () => [
      {
        title: t('intro.s1Title'),
        body: t('intro.s1Body'),
        art: (
          <SnapArt size={art} sentLabel={t('welcome.notifyTitle', { name: INTRO_FRIENDS[0] })} />
        ),
      },
      { title: t('intro.s2Title'), body: t('intro.s2Body'), art: <CircleArt size={art} /> },
      {
        title: t('intro.s3Title'),
        body: t('intro.s3Body'),
        art: <MemoryArt size={art} month={date(new Date(), { month: 'long', year: 'numeric' })} />,
      },
    ],
    [art, date, t],
  );
  const last = index === pages.length - 1;

  const next = useCallback(() => {
    if (last) onDone();
    else slides.current?.goTo(index + 1);
  }, [index, last, onDone]);

  return (
    <View style={s.page}>
      <SkyWash />
      <Screen padded={false} clear>
        <View style={s.bar}>
          <View style={s.side} />
          <Wordmark size={30} blink="loop" blinkDelay={duration.scene} />
          <View style={s.side}>
            {last ? null : (
              <Tap onPress={onDone} style={s.skip} accessibilityLabel={t('intro.skip')}>
                <Txt variant="label" tone="muted">
                  {t('intro.skip')}
                </Txt>
              </Tap>
            )}
          </View>
        </View>

        <View style={s.slides}>
          <Slides ref={slides} onIndexChange={setIndex}>
            {pages.map((p, i) => (
              <View key={i} style={s.slide}>
                <View style={s.art}>{p.art}</View>
                <View style={s.words}>
                  <Txt variant="title" center>
                    {p.title}
                  </Txt>
                  <Txt variant="body" tone="muted" center>
                    {p.body}
                  </Txt>
                </View>
              </View>
            ))}
          </Slides>
        </View>

        <View style={s.footer}>
          <View
            style={s.dots}
            accessible
            accessibilityLabel={t('intro.pages', { index: index + 1, total: pages.length })}
          >
            {pages.map((_, i) => (
              <View key={i} style={[s.dot, i === index && s.dotOn]} />
            ))}
          </View>
          <Animated.View key={last ? 'start' : 'next'} entering={FadeIn.duration(duration.fast)}>
            <Button label={last ? t('intro.start') : t('intro.next')} onPress={next} block />
          </Animated.View>
        </View>
      </Screen>
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    bar: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.md,
    },
    side: { width: 88, alignItems: 'flex-end' },
    skip: {
      minHeight: layout.minTouch,
      justifyContent: 'center',
      paddingHorizontal: space.md,
    },
    slides: { flex: 1 },
    slide: { flex: 1, justifyContent: 'center', gap: space.xxl, paddingHorizontal: space.xxl },
    art: { alignItems: 'center' },
    words: { gap: space.sm, alignSelf: 'center', maxWidth: layout.maxTextWidth },
    footer: { gap: space.lg, paddingHorizontal: space.xxl, paddingBottom: space.md },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
    dot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: c.border },
    dotOn: { width: 24, backgroundColor: c.text },
  });
