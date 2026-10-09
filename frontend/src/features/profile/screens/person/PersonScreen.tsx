/**
 * Trang cá nhân của một người — mở khi chạm tên được tag trong ảnh.
 *
 * Ai cũng mở được, trừ khi người đó KHOÁ trang: khi đó người ngoài góc của họ
 * chỉ thấy tên, ảnh và @tên (server đã cắt bớt, màn này chỉ vẽ cái nhận được).
 * Không bao giờ có cấp thân ở đây — cấp thân nằm ở trang riêng của một cặp.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Avatar, Button, Card, EmptyState, Flex, Icon, Loading, Screen, TopBar, Txt } from '@ui';
import { duration, space, useColors, useStyles } from '@design';
import { useDate, useT } from '@i18n';
import type { Relation } from '@/features/circle/types';
import type { PersonProfile } from '../../api/profileApi';

export type PersonRelation = Relation | 'self';

export function PersonScreen({
  person,
  error,
  relation,
  busy = false,
  onInvite,
  onAccept,
  onOpenPair,
  onClose,
}: {
  /** `null` khi đang tải. */
  person: PersonProfile | null;
  error: string | null;
  relation: PersonRelation;
  busy?: boolean;
  onInvite: () => void;
  onAccept: () => void;
  onOpenPair: () => void;
  onClose: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const date = useDate();

  const body = () => {
    if (error) return <EmptyState message={error} />;
    if (!person) return <Loading />;
    const closed = person.locked && relation !== 'friend' && relation !== 'self';
    return (
      <Animated.View entering={FadeIn.duration(duration.base)} style={s.body}>
        <View style={s.head}>
          <Avatar name={person.name} uri={person.uri} ring={false} size={112} />
          <Txt variant="title" center>
            {person.name}
          </Txt>
          <Txt variant="body" tone="muted" center>
            @{person.username}
          </Txt>
        </View>

        {closed ? (
          <Card style={s.card}>
            <Icon name="lock" size={22} color={c.textMuted} />
            <View style={s.cardText}>
              <Txt variant="label">{t('person.lockedTitle')}</Txt>
              <Txt variant="faint" tone="muted">
                {t('person.lockedMessage', { name: person.name })}
              </Txt>
            </View>
          </Card>
        ) : (
          <Card style={s.card}>
            <View style={s.cardText}>
              {person.joinedAt !== undefined ? (
                <Txt variant="faint" tone="muted">
                  {t('person.joined', {
                    month: date(new Date(person.joinedAt), { month: 'long', year: 'numeric' }),
                  })}
                </Txt>
              ) : null}
              <Txt variant="label">
                {person.mutual && person.mutual.length > 0
                  ? t('person.mutual', { names: person.mutual.join(', ') })
                  : t('person.noMutual')}
              </Txt>
            </View>
          </Card>
        )}

        {relation === 'self' ? (
          <Txt variant="faint" tone="faint" center style={s.note}>
            {person.locked ? t('person.selfLocked') : t('person.selfOpen')}
          </Txt>
        ) : null}

        <Flex />
        <Action
          relation={relation}
          busy={busy}
          name={person.name}
          onInvite={onInvite}
          onAccept={onAccept}
          onOpenPair={onOpenPair}
        />
      </Animated.View>
    );
  };

  return (
    <Screen>
      <TopBar closeLabel={t('common.closeScreen')} closeIcon="back" onClose={onClose} />
      {body()}
    </Screen>
  );
}

/** Đúng một nút chính, đổi theo quan hệ. */
function Action({
  relation,
  busy,
  name,
  onInvite,
  onAccept,
  onOpenPair,
}: {
  relation: PersonRelation;
  busy: boolean;
  name: string;
  onInvite: () => void;
  onAccept: () => void;
  onOpenPair: () => void;
}) {
  const t = useT();
  switch (relation) {
    case 'self':
      return null;
    case 'friend':
      return <Button label={t('person.openPair', { name })} onPress={onOpenPair} block />;
    case 'incoming':
      return <Button label={t('friends.invites.accept')} onPress={onAccept} loading={busy} block />;
    case 'requested':
      return <Button label={t('friends.search.requested')} variant="ghost" disabled block />;
    case 'none':
      return <Button label={t('person.invite')} onPress={onInvite} loading={busy} block />;
  }
}

const make = () =>
  StyleSheet.create({
    body: { flex: 1, paddingBottom: space.md },
    head: { alignItems: 'center', gap: space.xs, paddingTop: space.xl, paddingBottom: space.xxl },
    card: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    cardText: { flex: 1, gap: space.xs },
    note: { paddingTop: space.lg },
  });
