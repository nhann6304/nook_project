/**
 * Bạn bè — theo bảng thiết kế C12. Mở từ nút góc trái / viên "N bạn" ở camera.
 *
 * Trên cùng là thẻ mời (còn bao nhiêu chỗ), dưới là từng người với việc gần
 * nhất giữa hai người. Chạm một người → trang riêng của hai người. Người lâu
 * không có gì mới thì vòng đứt nét, và dòng phụ rủ gửi một tấm — không trách.
 *
 * Vòng màu là cấp thân — chỉ mình thấy, nên dòng chân màn nói rõ điều đó.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar, Button, EmptyState, IconButton, Scroll, Screen, Tap, Txt } from '@ui';
import { radius, space, spring, useColors, useStyles, type Palette } from '@design';
import { useAgo, useT } from '@i18n';
import { CIRCLE_SIZE, type Friend } from '../types';

const STAGGER = 45;

export function CircleScreen({
  friends,
  onInvite,
  onOpenFriend,
  onClose,
}: {
  friends: readonly Friend[];
  onInvite: () => void;
  onOpenFriend: (id: string) => void;
  onClose: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const ago = useAgo();
  const left = CIRCLE_SIZE - friends.length;

  const sub = (f: Friend) => {
    if (f.dormant || f.lastAt === undefined) return t('friends.dormant');
    const when = ago(new Date(f.lastAt));
    return f.lastKind === 'message'
      ? t('friends.messaged', { ago: when })
      : t('friends.sentPhoto', { ago: when });
  };

  return (
    <Screen padded={false}>
      <View style={s.bar}>
        <IconButton label={t('home.backToCamera')} onPress={onClose} style={s.round}>
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </IconButton>
        <Txt variant="title" style={s.title}>
          {t('friends.title')}
        </Txt>
        <Txt variant="label" tone="faint">
          {t('friends.slots', { filled: friends.length, total: CIRCLE_SIZE })}
        </Txt>
      </View>

      <Scroll>
        <View style={s.invite}>
          <View style={s.inviteText}>
            <Txt variant="label">{t('friends.inviteTitle')}</Txt>
            <Txt variant="faint" tone="muted">
              {left > 0 ? t('friends.inviteLeft', { count: left }) : t('friends.full')}
            </Txt>
          </View>
          <Button
            label={t('friends.sendLink')}
            onPress={onInvite}
            disabled={left <= 0}
            style={s.inviteBtn}
          />
        </View>

        {friends.length === 0 ? (
          <EmptyState
            title={t('circle.waitingTitle', { count: CIRCLE_SIZE })}
            message={t('circle.waitingMessage')}
          />
        ) : (
          <View style={s.list}>
            {friends.map((f, i) => (
              <Animated.View
                key={f.id}
                entering={FadeInDown.delay(i * STAGGER)
                  .springify()
                  .damping(spring.enter.damping)}
              >
                <FriendRow friend={f} sub={sub(f)} onOpen={onOpenFriend} />
              </Animated.View>
            ))}
          </View>
        )}

        <Txt variant="faint" tone="faint" center style={s.note}>
          {t('friends.ringNote')}
        </Txt>
      </Scroll>
    </Screen>
  );
}

const FriendRow = memo(function FriendRow({
  friend,
  sub,
  onOpen,
}: {
  friend: Friend;
  sub: string;
  onOpen: (id: string) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <Tap
      onPress={() => onOpen(friend.id)}
      scaleTo={0.98}
      style={s.row}
      accessibilityLabel={friend.name}
    >
      <View style={friend.dormant ? s.faded : null}>
        <Avatar
          name={friend.name}
          uri={friend.uri}
          level={friend.level}
          dormant={friend.dormant}
          size={52}
          recyclingKey={friend.id}
        />
      </View>
      <View style={s.rowText}>
        <Txt variant="section" tone={friend.dormant ? 'muted' : 'default'} numberOfLines={1}>
          {friend.name}
        </Txt>
        <Txt variant="faint" tone="faint" numberOfLines={1}>
          {sub}
        </Txt>
      </View>
      <Ionicons name="chevron-forward" size={18} color={c.textFaint} />
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    bar: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingHorizontal: space.lg,
    },
    round: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: c.surface },
    title: { flex: 1, fontSize: 20, lineHeight: 26 },

    invite: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      marginHorizontal: space.lg,
      marginTop: space.md,
      padding: space.lg,
      borderRadius: radius.lg,
      backgroundColor: c.surface,
    },
    inviteText: { flex: 1, gap: 2 },
    inviteBtn: { minHeight: 44, paddingHorizontal: space.lg, borderRadius: radius.sm + 2 },

    list: { marginTop: space.md },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md + 2,
      paddingHorizontal: space.lg,
      paddingVertical: space.sm + 1,
    },
    faded: { opacity: 0.55 },
    rowText: { flex: 1, gap: 2 },
    note: { paddingHorizontal: space.huge - space.sm, paddingTop: space.xxl },
  });
