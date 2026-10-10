/**
 * Ba hình của màn Giới thiệu — vẽ bằng chính mảnh của app (ảnh mẫu, avatar,
 * kính), không dùng ảnh minh hoạ: người mới thấy đúng thứ họ sắp dùng.
 *
 *   SnapArt    khung ảnh bo như camera + thẻ "vừa gửi" nổi lên
 *   CircleArt  mười chỗ quanh một trái tim — tám bạn, hai chỗ còn trống
 *   MemoryArt  một tháng trong cuốn lịch: ngày có ảnh, ngày trống là chấm
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Avatar, Glass, Icon, Img, Txt } from '@ui';
import { duration, radius, space, useColors, useStyles, type Palette } from '@design';
import { SEED_MOMENTS } from '@/mocks/moments';
import { INTRO_FRIENDS } from '@/mocks/intro';

const PHOTOS = SEED_MOMENTS.map((m) => m.photo);

export const SnapArt = memo(function SnapArt({
  size,
  sentLabel,
}: {
  size: number;
  sentLabel: string;
}) {
  const s = useStyles(make);
  const c = useColors();
  const frame = size * 0.78;
  return (
    <View style={[s.box, { width: size, height: size }]}>
      <View style={[s.back, { width: frame * 0.8, height: frame * 0.8 }]}>
        <Img source={PHOTOS[2]} style={s.fill} transition={0} />
      </View>
      <View style={[s.frame, { width: frame, height: frame }]}>
        <Img source={PHOTOS[0]} style={s.fill} transition={0} />
      </View>
      <Animated.View
        entering={FadeInDown.delay(duration.slow).duration(duration.slow)}
        style={s.sent}
      >
        <Glass radius={radius.full} style={s.sentPill}>
          <Icon name="heart" size={16} color={c.accent} />
          <Txt variant="label" numberOfLines={1}>
            {sentLabel}
          </Txt>
        </Glass>
      </Animated.View>
    </View>
  );
});

const SLOTS = 10;
const AV = 54;

export const CircleArt = memo(function CircleArt({ size }: { size: number }) {
  const s = useStyles(make);
  const c = useColors();
  const r = size / 2 - AV / 2 - space.xs;
  return (
    <View style={[s.box, { width: size, height: size }]}>
      <View style={[s.ring, { width: r * 2, height: r * 2, borderRadius: r }]} />
      {Array.from({ length: SLOTS }, (_, i) => {
        const a = (i / SLOTS) * Math.PI * 2 - Math.PI / 2;
        const x = size / 2 + Math.cos(a) * r - AV / 2;
        const y = size / 2 + Math.sin(a) * r - AV / 2;
        const name = INTRO_FRIENDS[i];
        return (
          <Animated.View
            key={i}
            entering={FadeIn.delay(i * 45).duration(duration.base)}
            style={[s.slot, { left: x, top: y }]}
          >
            {name ? (
              <Avatar name={name} size={AV} level={9 - i} />
            ) : (
              <View style={s.empty}>
                <Icon name="add" size={22} color={c.textMuted} />
              </View>
            )}
          </Animated.View>
        );
      })}
      <View style={s.center}>
        <Icon name="heart" size={44} color={c.accent} />
      </View>
    </View>
  );
});

/** Ngày nào có ảnh (chỉ số ô trong tháng) — rải cho trông như thật. */
const FILLED: Record<number, number> = { 2: 0, 5: 1, 6: 2, 9: 3, 13: 0, 16: 2, 17: 1, 20: 3 };
const DAYS = 21;

export const MemoryArt = memo(function MemoryArt({ size, month }: { size: number; month: string }) {
  const s = useStyles(make);
  const cell = (size - space.lg * 2 - space.xs * 6) / 7;
  return (
    <View style={[s.box, { width: size, height: size }]}>
      <Glass radius={radius.xl} style={s.month}>
        <Txt variant="section" style={s.monthTitle}>
          {month}
        </Txt>
        <View style={s.grid}>
          {Array.from({ length: DAYS }, (_, i) => {
            const photo = FILLED[i];
            return (
              <View key={i} style={[s.day, { width: cell, height: cell }]}>
                {photo !== undefined ? (
                  <Animated.View
                    entering={FadeIn.delay(i * 30).duration(duration.base)}
                    style={s.fill}
                  >
                    <Img source={PHOTOS[photo]} style={s.dayPhoto} transition={0} />
                  </Animated.View>
                ) : (
                  <View style={s.dot} />
                )}
              </View>
            );
          })}
        </View>
      </Glass>
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    box: { alignItems: 'center', justifyContent: 'center' },
    fill: { flex: 1, alignSelf: 'stretch' },
    frame: {
      borderRadius: radius.viewfinder,
      borderCurve: 'continuous',
      overflow: 'hidden',
      backgroundColor: c.surface,
    },
    back: {
      position: 'absolute',
      top: 0,
      right: 0,
      borderRadius: radius.xl,
      overflow: 'hidden',
      opacity: 0.7,
      transform: [{ rotate: '8deg' }],
    },
    sent: { position: 'absolute', bottom: 0, alignSelf: 'center' },
    sentPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingHorizontal: space.lg,
      paddingVertical: space.sm + 2,
    },

    ring: { position: 'absolute', borderWidth: 1.5, borderColor: c.border },
    slot: { position: 'absolute' },
    empty: {
      width: AV,
      height: AV,
      borderRadius: radius.full,
      backgroundColor: c.glass,
      alignItems: 'center',
      justifyContent: 'center',
    },
    center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },

    month: { padding: space.lg, gap: space.md, alignSelf: 'stretch' },
    monthTitle: { textAlign: 'left' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
    day: { alignItems: 'center', justifyContent: 'center' },
    dayPhoto: { flex: 1, alignSelf: 'stretch', borderRadius: radius.sm - 4 },
    dot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: c.textFaint },
  });
