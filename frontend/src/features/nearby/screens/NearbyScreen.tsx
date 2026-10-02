/**
 * Tìm quanh đây — gặp người đang ở gần, CŨNG đang mở màn này.
 *
 * Người dùng chọn bán kính. Ba lời hứa nằm ngay trên màn, vì đây là chỗ người
 * ta lo nhất: chỉ người cũng đang bật mới thấy nhau · không ai thấy vị trí, chỉ
 * thấy "dưới 500 m" · tự tắt sau 5 phút.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Flex,
  HelperText,
  Scroll,
  Screen,
  Tap,
  TopBar,
  Txt,
} from '@ui';
import { motion, radius as rad, space, useColors, useStyles, type Palette } from '@design';
import { useT } from '@i18n';
import type { Person, Relation } from '@/features/circle/types';
import { RADII, type NearbyPerson, type Radius } from '../lib/nearbyApi';
import type { NearbyStatus } from '../lib/useNearby';

export type NearbyRow = NearbyPerson & { relation: Relation };

export function NearbyScreen({
  status,
  radius,
  people,
  left,
  busy,
  onRadius,
  onStart,
  onStop,
  onOpenSettings,
  onRequest,
  onAccept,
  onOpenPerson,
  onClose,
}: {
  status: NearbyStatus;
  radius: Radius;
  people: readonly NearbyRow[];
  /** Số giây còn lại trước khi tự tắt. */
  left: number;
  busy: ReadonlySet<string>;
  onRadius: (r: Radius) => void;
  onStart: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
  onRequest: (id: string) => void;
  onAccept: (p: Person) => void;
  onOpenPerson: (id: string) => void;
  onClose: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const distance = (r: Radius) =>
    r < 1000 ? t('nearby.meters', { n: r }) : t('nearby.km', { n: r / 1000 });
  const active = status === 'active';

  return (
    <Screen padded={false}>
      <TopBar title={t('nearby.title')} closeLabel={t('common.closeScreen')} onClose={onClose} />

      <View style={s.radii} accessibilityRole="radiogroup" accessibilityLabel={t('nearby.radius')}>
        {RADII.map((r) => (
          <Tap
            key={r}
            onPress={() => onRadius(r)}
            scaleTo={0.96}
            accessibilityRole="radio"
            accessibilityState={{ selected: r === radius }}
            style={[s.chip, r === radius && s.chipOn]}
          >
            <Txt variant="label" tone={r === radius ? 'onAccent' : 'default'}>
              {distance(r)}
            </Txt>
          </Tap>
        ))}
      </View>

      {status === 'denied' ? (
        <EmptyState
          title={t('nearby.deniedTitle')}
          message={t('nearby.deniedMessage')}
          actionLabel={t('common.openSettings')}
          onAction={onOpenSettings}
        />
      ) : active ? (
        <Scroll>
          <Animated.View entering={motion.appear()}>
            <Card style={s.live}>
              <View style={s.dot} />
              <View style={s.liveText}>
                <Txt variant="label">{t('nearby.liveTitle')}</Txt>
                <Txt variant="faint" tone="muted">
                  {t('nearby.liveLeft', {
                    time: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`,
                  })}
                </Txt>
              </View>
              <Button label={t('nearby.stop')} variant="ghost" onPress={onStop} style={s.stop} />
            </Card>
          </Animated.View>

          {people.length === 0 ? (
            <EmptyState
              title={t('nearby.emptyTitle', { distance: distance(radius) })}
              message={t('nearby.emptyMessage')}
            />
          ) : (
            people.map((p, i) => (
              <Animated.View key={p.id} entering={motion.rise(i)} layout={motion.reflow()}>
                <NearbyItem
                  person={p}
                  sub={t('nearby.within', { username: p.username, distance: distance(p.within) })}
                  busy={busy.has(p.id)}
                  labels={{
                    none: t('friends.search.add'),
                    requested: t('friends.search.requested'),
                    incoming: t('friends.invites.accept'),
                    friend: t('nearby.inCircle'),
                  }}
                  onRequest={onRequest}
                  onAccept={onAccept}
                  onOpen={onOpenPerson}
                />
              </Animated.View>
            ))
          )}
        </Scroll>
      ) : (
        <View style={s.intro}>
          {(['nearby.ruleMutual', 'nearby.ruleNoSpot', 'nearby.ruleAutoOff'] as const).map(
            (key, i) => (
              <View key={key} style={s.rule}>
                <Ionicons name={RULE_ICONS[i]!} size={22} color={c.accent} />
                <Txt variant="body" style={s.ruleText}>
                  {t(key)}
                </Txt>
              </View>
            ),
          )}
          {status === 'failed' ? <HelperText tone="danger">{t('nearby.failed')}</HelperText> : null}
          <Flex />
          <Button
            label={t('nearby.start', { distance: distance(radius) })}
            onPress={onStart}
            loading={status === 'locating'}
            block
          />
        </View>
      )}
    </Screen>
  );
}

const RULE_ICONS = ['people-outline', 'eye-off-outline', 'timer-outline'] as const;

const NearbyItem = memo(function NearbyItem({
  person,
  sub,
  busy,
  labels,
  onRequest,
  onAccept,
  onOpen,
}: {
  person: NearbyRow;
  sub: string;
  busy: boolean;
  labels: Record<Relation, string>;
  onRequest: (id: string) => void;
  onAccept: (p: Person) => void;
  onOpen: (id: string) => void;
}) {
  const s = useStyles(make);
  const done = person.relation === 'requested' || person.relation === 'friend';
  return (
    <Tap
      onPress={() => onOpen(person.id)}
      scaleTo={0.98}
      style={s.row}
      accessibilityLabel={person.name}
    >
      <Avatar name={person.name} uri={person.uri} ring={false} size={52} recyclingKey={person.id} />
      <View style={s.rowText}>
        <Txt variant="section" numberOfLines={1}>
          {person.name}
        </Txt>
        <Txt variant="faint" tone="faint" numberOfLines={1}>
          {sub}
        </Txt>
      </View>
      <Button
        label={labels[person.relation]}
        variant={done ? 'ghost' : 'secondary'}
        disabled={done}
        loading={busy}
        onPress={() => (person.relation === 'incoming' ? onAccept(person) : onRequest(person.id))}
        style={s.btn}
      />
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    radii: {
      flexDirection: 'row',
      gap: space.sm,
      paddingHorizontal: space.lg,
      paddingTop: space.sm,
      paddingBottom: space.md,
    },
    chip: {
      flex: 1,
      height: 40,
      borderRadius: rad.full,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipOn: { backgroundColor: c.accent },
    intro: { flex: 1, paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.lg },
    rule: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
    ruleText: { flex: 1 },
    live: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      marginHorizontal: space.lg,
      marginBottom: space.md,
    },
    dot: { width: 10, height: 10, borderRadius: rad.full, backgroundColor: c.mint },
    liveText: { flex: 1, gap: 2 },
    stop: { minHeight: 40, paddingHorizontal: space.md },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md + 2,
      paddingHorizontal: space.lg,
      paddingVertical: space.sm + 1,
    },
    rowText: { flex: 1, gap: 2 },
    btn: { minHeight: 40, paddingHorizontal: space.lg, borderRadius: rad.sm + 2 },
  });
