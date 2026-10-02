/**
 * Trang của hai người — theo bảng thiết kế C14.
 *
 * Đây là chỗ DUY NHẤT hiện cấp thân bằng chữ, và chỉ mình với người đó thấy
 * (luật sản phẩm). Không so với ai khác, không xếp thứ tự.
 */
import { memo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Avatar, Button, IconButton, Img, Scroll, Screen, Txt } from '@ui';
import { duration, font, layout, radius, space, useColors, useStyles, type Palette } from '@design';
import { useT } from '@i18n';
import type { Moment } from '@/features/feed/types';
import type { Friend } from '../types';

const LEVEL_KEYS = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10'] as const;
const COLS = 3;
const GAP = 3;

export function FriendScreen({
  friend,
  photos,
  onMessage,
  onAlbum,
  onClose,
}: {
  friend: Friend;
  photos: readonly Moment[];
  onMessage: () => void;
  onAlbum: () => void;
  onClose: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const { width } = useWindowDimensions();
  const cell = Math.floor((width - GAP * (COLS - 1)) / COLS);
  const level = Math.min(Math.max(friend.level, 1), 10);
  const levelName = t(`friends.levels.${LEVEL_KEYS[level - 1] ?? 'l1'}`);

  return (
    <Screen padded={false}>
      <View style={s.bar}>
        <IconButton label={t('common.closeScreen')} onPress={onClose} style={s.round}>
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </IconButton>
      </View>

      <Scroll>
        <View style={s.head}>
          <Animated.View entering={FadeIn.duration(duration.base)}>
            <Avatar
              name={friend.name}
              uri={friend.uri}
              level={friend.level}
              dormant={friend.dormant}
              size={104}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(duration.fast)} style={s.headText}>
            <Txt variant="title">{friend.name}</Txt>
            <View style={s.meta}>
              <View style={s.levelPill}>
                <Txt variant="faint" tone="honey" style={s.levelText}>
                  {t('friends.level', { level, name: levelName })}
                </Txt>
              </View>
              {friend.memories !== undefined && friend.days !== undefined ? (
                <Txt variant="faint" tone="muted">
                  {t('friends.together', { memories: friend.memories, days: friend.days })}
                </Txt>
              ) : null}
            </View>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(duration.base)} style={s.actions}>
          <Button
            label={t('friends.message')}
            variant="secondary"
            onPress={onMessage}
            style={s.action}
          />
          <Button
            label={t('friends.album')}
            variant="secondary"
            onPress={onAlbum}
            style={s.action}
          />
        </Animated.View>

        <View style={s.section}>
          <Txt variant="faint" tone="muted" style={s.sectionTitle}>
            {t('friends.photos')}
          </Txt>
          {friend.toNext !== undefined && level < 10 ? (
            <Txt variant="faint" tone="faint">
              {t('friends.toNext', { count: friend.toNext, level: level + 1 })}
            </Txt>
          ) : null}
        </View>

        {photos.length === 0 ? (
          <Txt variant="body" tone="faint" center style={s.none}>
            {t('friends.noPhotos')}
          </Txt>
        ) : (
          <View style={s.grid}>
            {photos.map((m, i) => (
              <Cell key={m.id} moment={m} size={cell} index={i} />
            ))}
          </View>
        )}

        <Txt variant="faint" tone="faint" center style={s.private}>
          {t('friends.private', { name: friend.name })}
        </Txt>
      </Scroll>
    </Screen>
  );
}

const Cell = memo(function Cell({
  moment,
  size,
  index,
}: {
  moment: Moment;
  size: number;
  index: number;
}) {
  const s = useStyles(make);
  return (
    <Animated.View entering={FadeIn.delay(duration.base + index * 40)}>
      <Img
        source={moment.photo}
        recyclingKey={moment.id}
        shimmer
        style={[s.cell, { width: size, height: Math.round(size / layout.cameraFrameRatio) }]}
      />
    </Animated.View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    bar: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: space.lg,
    },
    round: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: c.surface },
    head: { alignItems: 'center', paddingTop: space.xs },
    headText: { alignItems: 'center', marginTop: space.md + 2, gap: space.xs + 2 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    levelPill: {
      height: 26,
      borderRadius: radius.full,
      paddingHorizontal: space.sm + 2,
      justifyContent: 'center',
      backgroundColor: c.surfaceRaised,
    },
    levelText: { fontFamily: font.bodyBold },
    actions: {
      flexDirection: 'row',
      gap: space.sm + 2,
      marginHorizontal: space.lg,
      marginTop: space.xl,
    },
    action: { flex: 1, minHeight: 46, borderRadius: radius.sm + 2 },
    section: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: space.lg,
      marginTop: space.xxl,
      marginBottom: space.sm + 2,
    },
    sectionTitle: { fontFamily: font.bodyBold },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
    cell: { borderRadius: 0 },
    none: { paddingVertical: space.xxl, paddingHorizontal: space.xxl },
    private: { paddingTop: space.xxl },
  });
