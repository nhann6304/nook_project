/**
 * Bạn bè — theo bảng thiết kế C12. Mở từ nút góc trái / viên "N bạn" ở camera.
 *
 * Trên cùng là thẻ mời (còn bao nhiêu chỗ), dưới là từng người với việc gần
 * nhất giữa hai người. Chạm một người → trang riêng của hai người. Người lâu
 * không có gì mới thì vòng đứt nét, và dòng phụ rủ gửi một tấm — không trách.
 *
 * Vòng màu là cấp thân — chỉ mình thấy, nên dòng chân màn nói rõ điều đó.
 *
 * Ô tìm ở đầu: gõ là lọc ngay người trong góc theo tên (không cần mạng), đồng
 * thời tìm người khác trên Nook theo @tên để mời. Không thấy ai thì rủ gửi link.
 *
 * Ai đã mời mình thì nằm trên cùng, nhận hoặc từ chối ngay tại chỗ.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import {
  Avatar,
  Button,
  EmptyState,
  Field,
  HelperText,
  IconButton,
  Scroll,
  Screen,
  Spinner,
  Tap,
  Txt,
} from '@ui';
import { motion, radius, space, useColors, useStyles, type Palette } from '@design';
import { useAgo, useT } from '@i18n';
import { CIRCLE_SIZE, type Friend, type Invite, type Person, type PersonResult } from '../types';
import { MIN_QUERY } from '../lib/circleApi';
import { fold, matches } from '@/lib/fold';

export function CircleScreen({
  friends,
  onInvite,
  onOpenNearby,
  onOpenFriend,
  onClose,
  query,
  onQueryChange,
  people,
  searching,
  incoming,
  busy,
  onRequest,
  onAccept,
  onDecline,
  error,
}: {
  friends: readonly Friend[];
  onInvite: () => void;
  onOpenNearby: () => void;
  onOpenFriend: (id: string) => void;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  /** Người ngoài góc khớp `query` — server trả về, kèm quan hệ với mình. */
  people: readonly PersonResult[];
  searching: boolean;
  /** Ai đã mời mình, đang chờ. */
  incoming: readonly Invite[];
  /** Ai đang chờ server trả lời (nhận / từ chối). */
  busy: ReadonlySet<string>;
  onRequest: (id: string) => void;
  onAccept: (person: Person) => void;
  onDecline: (id: string) => void;
  error: string | null;
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
    <Screen padded={false} keyboard>
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

      <View style={s.searchBox}>
        <Field
          value={query}
          onChangeText={onQueryChange}
          placeholder={t('friends.search.placeholder')}
          accessibilityLabel={t('friends.search.placeholder')}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          prefix={<Ionicons name="search" size={18} color={c.textFaint} style={s.searchIcon} />}
          suffix={
            query ? (
              <IconButton label={t('friends.search.clear')} onPress={() => onQueryChange('')}>
                <Ionicons name="close-circle" size={18} color={c.textFaint} />
              </IconButton>
            ) : null
          }
        />
      </View>

      {fold(query) ? (
        <SearchResults
          query={query}
          friends={friends}
          people={people}
          searching={searching}
          full={left <= 0}
          error={error}
          sub={sub}
          onOpenFriend={onOpenFriend}
          onRequest={onRequest}
          onAccept={onAccept}
          onInvite={onInvite}
        />
      ) : (
        <Scroll>
          {incoming.length > 0 ? (
            <>
              <Txt variant="label" tone="muted" style={s.section}>
                {t('friends.invites.title')}
              </Txt>
              {incoming.map((inv) => (
                <Animated.View key={inv.id} exiting={motion.leave()} layout={motion.reflow()}>
                  <InviteRow
                    invite={inv}
                    sub={t('friends.invites.sub', {
                      username: inv.username,
                      ago: ago(new Date(inv.at)),
                    })}
                    busy={busy.has(inv.id)}
                    full={left <= 0}
                    acceptLabel={t('friends.invites.accept')}
                    acceptA11y={t('friends.invites.acceptLabel', { name: inv.name })}
                    declineA11y={t('friends.invites.decline', { name: inv.name })}
                    onAccept={onAccept}
                    onDecline={onDecline}
                  />
                </Animated.View>
              ))}
              {error ? (
                <View style={s.hint}>
                  <HelperText tone="danger">{error}</HelperText>
                </View>
              ) : null}
            </>
          ) : null}

          <Tap
            onPress={onOpenNearby}
            scaleTo={0.98}
            style={s.nearby}
            accessibilityLabel={t('nearby.title')}
          >
            <Ionicons name="location-outline" size={22} color={c.accent} />
            <View style={s.inviteText}>
              <Txt variant="label">{t('nearby.title')}</Txt>
              <Txt variant="faint" tone="muted">
                {t('nearby.entryHint')}
              </Txt>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textFaint} />
          </Tap>

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
                <Animated.View key={f.id} entering={motion.rise(i)} layout={motion.reflow()}>
                  <FriendRow friend={f} sub={sub(f)} onOpen={onOpenFriend} />
                </Animated.View>
              ))}
            </View>
          )}

          <Txt variant="faint" tone="faint" center style={s.note}>
            {t('friends.ringNote')}
          </Txt>
        </Scroll>
      )}
    </Screen>
  );
}

function SearchResults({
  query,
  friends,
  people,
  searching,
  full,
  error,
  sub,
  onOpenFriend,
  onRequest,
  onAccept,
  onInvite,
}: {
  query: string;
  friends: readonly Friend[];
  people: readonly PersonResult[];
  searching: boolean;
  full: boolean;
  error: string | null;
  sub: (f: Friend) => string;
  onOpenFriend: (id: string) => void;
  onRequest: (id: string) => void;
  onAccept: (person: Person) => void;
  onInvite: () => void;
}) {
  const s = useStyles(make);
  const t = useT();
  const inCircle = friends.filter((f) => matches(query, f.name));
  const tooShort = fold(query).length < MIN_QUERY;
  const nobody = !tooShort && !searching && inCircle.length === 0 && people.length === 0;

  if (nobody) {
    return (
      <EmptyState
        title={t('friends.search.noneTitle', { query: query.trim() })}
        message={t('friends.search.noneMessage')}
        actionLabel={full ? undefined : t('friends.sendLink')}
        onAction={full ? undefined : onInvite}
      />
    );
  }

  return (
    <Scroll>
      {inCircle.length > 0 ? (
        <>
          <Txt variant="label" tone="muted" style={s.section}>
            {t('friends.search.inCircle')}
          </Txt>
          {inCircle.map((f) => (
            <FriendRow key={f.id} friend={f} sub={sub(f)} onOpen={onOpenFriend} />
          ))}
        </>
      ) : null}

      <Txt variant="label" tone="muted" style={s.section}>
        {t('friends.search.onNook')}
      </Txt>
      {tooShort ? (
        <Txt variant="faint" tone="faint" style={s.hint}>
          {t('friends.search.typeMore')}
        </Txt>
      ) : searching ? (
        <View style={s.spinner}>
          <Spinner />
        </View>
      ) : (
        people.map((p) => (
          <PersonRow
            key={p.id}
            person={p}
            disabled={full}
            labels={{
              none: t('friends.search.add'),
              requested: t('friends.search.requested'),
              incoming: t('friends.invites.accept'),
            }}
            a11y={
              p.relation === 'incoming'
                ? t('friends.invites.acceptLabel', { name: p.name })
                : t('friends.search.addLabel', { name: p.name })
            }
            onRequest={onRequest}
            onAccept={onAccept}
          />
        ))
      )}
      {error ? (
        <View style={s.hint}>
          <HelperText tone="danger">{error}</HelperText>
        </View>
      ) : null}
    </Scroll>
  );
}

/** Kết quả tìm: một nút, đổi theo quan hệ — mời · đã mời · nhận lời. */
const PersonRow = memo(function PersonRow({
  person,
  disabled,
  labels,
  a11y,
  onRequest,
  onAccept,
}: {
  person: PersonResult;
  disabled: boolean;
  labels: Record<'none' | 'requested' | 'incoming', string>;
  a11y: string;
  onRequest: (id: string) => void;
  onAccept: (person: Person) => void;
}) {
  const s = useStyles(make);
  const sent = person.relation === 'requested';
  const label = person.relation === 'friend' ? labels.none : labels[person.relation];
  return (
    <View style={s.row}>
      <Avatar name={person.name} uri={person.uri} ring={false} size={52} recyclingKey={person.id} />
      <View style={s.rowText}>
        <Txt variant="section" numberOfLines={1}>
          {person.name}
        </Txt>
        <Txt variant="faint" tone="faint" numberOfLines={1}>
          @{person.username}
        </Txt>
      </View>
      <Button
        label={label}
        variant={sent ? 'ghost' : 'secondary'}
        disabled={sent || disabled}
        onPress={() => (person.relation === 'incoming' ? onAccept(person) : onRequest(person.id))}
        accessibilityLabel={a11y}
        style={s.addBtn}
      />
    </View>
  );
});

/** Một lời mời đang chờ: nhận (nút) hoặc từ chối (dấu ✕). */
const InviteRow = memo(function InviteRow({
  invite,
  sub,
  busy,
  full,
  acceptLabel,
  acceptA11y,
  declineA11y,
  onAccept,
  onDecline,
}: {
  invite: Invite;
  sub: string;
  busy: boolean;
  full: boolean;
  acceptLabel: string;
  acceptA11y: string;
  declineA11y: string;
  onAccept: (person: Person) => void;
  onDecline: (id: string) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View style={s.row}>
      <Avatar name={invite.name} uri={invite.uri} ring={false} size={52} recyclingKey={invite.id} />
      <View style={s.rowText}>
        <Txt variant="section" numberOfLines={1}>
          {invite.name}
        </Txt>
        <Txt variant="faint" tone="faint" numberOfLines={1}>
          {sub}
        </Txt>
      </View>
      <IconButton label={declineA11y} onPress={() => onDecline(invite.id)} disabled={busy}>
        <Ionicons name="close" size={20} color={c.textMuted} />
      </IconButton>
      <Button
        label={acceptLabel}
        variant="secondary"
        loading={busy}
        disabled={full}
        onPress={() => onAccept(invite)}
        accessibilityLabel={acceptA11y}
        style={s.addBtn}
      />
    </View>
  );
});

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
    nearby: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      marginHorizontal: space.lg,
      marginTop: space.md,
      padding: space.lg,
      borderRadius: radius.lg,
      backgroundColor: c.surface,
    },
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
    searchBox: { paddingHorizontal: space.lg, paddingTop: space.sm },
    searchIcon: { marginRight: space.sm },
    section: { paddingHorizontal: space.lg, paddingTop: space.xl, paddingBottom: space.sm },
    hint: { paddingHorizontal: space.lg },
    spinner: { paddingVertical: space.xl, alignItems: 'center' },
    addBtn: { minHeight: 40, paddingHorizontal: space.lg, borderRadius: radius.sm + 2 },
    note: { paddingHorizontal: space.huge - space.sm, paddingTop: space.xxl },
  });
