/**
 * Tìm quanh đây — gặp người đang ở gần, CŨNG đang mở màn này.
 *
 * Người dùng chọn bán kính. Ba lời hứa nằm ngay trên màn, vì đây là chỗ người
 * ta lo nhất: chỉ người cũng đang bật mới thấy nhau · không ai thấy vị trí, chỉ
 * thấy "dưới 500 m" · tự tắt sau 5 phút.
 */
import { memo, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import {
  Avatar,
  Button,
  EmptyState,
  Field,
  HelperText,
  Icon,
  Screen,
  Scroll,
  Tap,
  TopBar,
  Txt,
} from '@ui';
import { matches } from '@/lib/fold';
import { motion, radius as rad, space, useColors, useStyles, type Palette } from '@design';
import { useT } from '@i18n';
import type { Person, Relation } from '@/features/circle/types';
import { RADII, type NearbyPerson, type Radius } from '../lib/nearbyApi';
import type { NearbyStatus } from '../lib/useNearby';
import { Radar } from '../components/Radar';
import { NearbyMap } from '../components/NearbyMap';
import { PersonSheet } from '../components/PersonSheet';
import { ChoiceRow } from '@/features/settings/components/Pref';

export type NearbyRow = NearbyPerson & { relation: Relation };

export function NearbyScreen({
  status,
  radius,
  people,
  left,
  busy,
  meName,
  meUri,
  center,
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
  /** Giây còn lại trước khi tự tắt. */
  left: number;
  busy: ReadonlySet<string>;
  meName: string;
  meUri?: string;
  /** Chỗ của mình, đã làm tròn — chỉ để vẽ bản đồ nền. */
  center: { latitude: number; longitude: number } | null;
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
  const { width } = useWindowDimensions();
  const distance = (r: Radius) =>
    r < 1000 ? t('nearby.meters', { n: r }) : t('nearby.km', { n: r / 1000 });
  const active = status === 'active';
  // Lọc tại chỗ theo tên / @tên — đông người quanh đây thì kéo tìm mỏi mắt.
  const [query, setQuery] = useState('');
  const shown = useMemo(
    () => (query.trim() ? people.filter((p) => matches(query, p.name, p.username)) : people),
    [people, query],
  );
  const [picked, setPicked] = useState<string | null>(null);
  const person = people.find((p) => p.id === picked) ?? null;
  const labels: Record<Relation, string> = {
    none: t('friends.search.add'),
    requested: t('friends.search.requested'),
    incoming: t('friends.invites.accept'),
    friend: t('nearby.inCircle'),
  };
  const act = (p: NearbyRow) => (p.relation === 'incoming' ? onAccept(p) : onRequest(p.id));
  const size = Math.min(width - space.lg * 2, RADAR_MAX);

  return (
    <Screen padded={false}>
      <View style={s.pad}>
        <TopBar title={t('nearby.title')} closeLabel={t('common.closeScreen')} onClose={onClose} />
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
          <Animated.View entering={motion.appear()} style={s.stage}>
            <Radar
              size={size}
              radius={radius}
              people={people}
              meName={meName}
              meUri={meUri}
              background={center ? <NearbyMap center={center} radius={radius} /> : undefined}
              onPick={setPicked}
            />
            <View style={s.withinChip}>
              <Icon name="pin" size={16} color={c.accent} />
              <Txt variant="label">{t('nearby.withinChip', { distance: distance(radius) })}</Txt>
            </View>
          </Animated.View>

          <View
            style={s.radii}
            accessibilityRole="radiogroup"
            accessibilityLabel={t('nearby.radius')}
          >
            {RADII.map((r) => (
              <Tap
                key={r}
                onPress={() => onRadius(r)}
                scaleTo={0.96}
                feedback="select"
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

          <View style={s.live}>
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
          </View>

          {people.length === 0 ? (
            <EmptyState
              title={t('nearby.emptyTitle', { distance: distance(radius) })}
              message={t('nearby.emptyMessage')}
            />
          ) : (
            <>
              <View style={s.search}>
                <Field
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t('nearby.search')}
                  accessibilityLabel={t('nearby.search')}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  prefix={
                    <View style={s.searchIcon}>
                      <Icon name="search" size={18} color={c.textFaint} />
                    </View>
                  }
                />
              </View>
              {shown.length === 0 ? (
                <Txt variant="body" tone="muted" center style={s.noMatch}>
                  {t('nearby.noMatch')}
                </Txt>
              ) : (
                shown.map((p, i) => (
                  <Animated.View key={p.id} entering={motion.rise(i)} layout={motion.reflow()}>
                    <NearbyItem
                      person={p}
                      sub={t('nearby.within', {
                        username: p.username,
                        distance: distance(p.within),
                      })}
                      busy={busy.has(p.id)}
                      labels={labels}
                      onRequest={onRequest}
                      onAccept={onAccept}
                      onOpen={setPicked}
                    />
                  </Animated.View>
                ))
              )}
            </>
          )}
        </Scroll>
      ) : (
        <Scroll>
          <View style={s.setup}>
            <Hero />
            <Txt variant="section" center style={s.heroTitle}>
              {t('nearby.heroTitle')}
            </Txt>
            <View style={s.choices}>
              {RADII.map((r) => (
                <ChoiceRow
                  key={r}
                  title={distance(r)}
                  selected={r === radius}
                  onPress={() => onRadius(r)}
                />
              ))}
            </View>
            <View style={s.rules}>
              {(['nearby.ruleMutual', 'nearby.ruleNoSpot', 'nearby.ruleAutoOff'] as const).map(
                (key, i) => (
                  <View key={key} style={s.rule}>
                    <Icon name={RULE_ICONS[i]!} size={18} color={c.accent} />
                    <Txt variant="faint" tone="muted" style={s.ruleText}>
                      {t(key)}
                    </Txt>
                  </View>
                ),
              )}
            </View>
            {status === 'failed' ? (
              <HelperText tone="danger">{t('nearby.failed')}</HelperText>
            ) : null}
            <Button
              label={t('nearby.enable')}
              onPress={onStart}
              loading={status === 'locating'}
              block
            />
          </View>
        </Scroll>
      )}

      <PersonSheet
        person={person}
        distance={person ? t('nearby.away', { distance: distance(person.within) }) : ''}
        status={t('nearby.openNow')}
        actionLabel={person ? labels[person.relation] : ''}
        actionDone={person?.relation === 'requested' || person?.relation === 'friend'}
        busy={person ? busy.has(person.id) : false}
        onAction={() => person && act(person)}
        viewLabel={t('nearby.viewProfile')}
        onView={() => {
          const id = picked;
          setPicked(null);
          if (id) onOpenPerson(id);
        }}
        closeLabel={t('common.closeScreen')}
        onClose={() => setPicked(null)}
      />
    </Screen>
  );
}

const RADAR_MAX = 340;

/** Ghim vị trí giữa ba vòng sóng — hình đầu trang khi chưa bật. */
function Hero() {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View style={s.hero}>
      <Svg width={HERO} height={HERO} style={StyleSheet.absoluteFill}>
        {[0.95, 0.7, 0.45].map((k) => (
          <Ellipse
            key={k}
            cx={HERO / 2}
            cy={HERO * 0.62}
            rx={(HERO / 2) * k}
            ry={(HERO / 2) * k * 0.38}
            fill={c.accent}
            fillOpacity={0.06}
            stroke={c.accent}
            strokeOpacity={0.35}
          />
        ))}
      </Svg>
      <View style={s.pin}>
        <Icon name="pin" size={40} color={c.accent} />
      </View>
    </View>
  );
}

const HERO = 160;

const RULE_ICONS = ['people', 'eyeOff', 'timer'] as const;

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
    pad: { paddingHorizontal: space.lg },
    stage: { paddingTop: space.md, gap: space.md, alignItems: 'center' },
    withinChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
      borderRadius: rad.full,
      backgroundColor: c.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    search: { paddingHorizontal: space.lg, paddingBottom: space.sm },
    noMatch: { paddingTop: space.xxl, paddingHorizontal: space.xl },
    searchIcon: { marginRight: space.sm },
    radii: {
      flexDirection: 'row',
      gap: space.xs,
      paddingHorizontal: space.lg,
      paddingTop: space.lg,
      paddingBottom: space.md,
    },
    chip: {
      flex: 1,
      height: 38,
      borderRadius: rad.full,
      backgroundColor: c.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipOn: { backgroundColor: c.accent, borderColor: c.accent },
    setup: {
      paddingHorizontal: space.lg,
      paddingTop: space.md,
      paddingBottom: space.xxl,
      gap: space.lg,
    },
    hero: {
      width: HERO,
      height: HERO,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pin: {
      width: 72,
      height: 72,
      borderRadius: rad.full,
      backgroundColor: c.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: space.lg,
    },
    heroTitle: { paddingHorizontal: space.xl },
    choices: { gap: space.sm },
    rules: { gap: space.sm },
    rule: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
    ruleText: { flex: 1 },
    live: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      marginHorizontal: space.lg,
      marginBottom: space.md,
      padding: space.md,
      borderRadius: rad.lg,
      backgroundColor: c.surface,
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
