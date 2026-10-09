/**
 * LOVO Pro — 20.000đ/tháng (08/10/2026, nhánh thử giao diện).
 *
 * Bán THỂ HIỆN BẢN THÂN và KỶ NIỆM ĐẸP HƠN, không bán quan hệ: chất liệu vòng,
 * icon app, video dài, recap có nhạc, ghim bạn thân, tặng bạn một tháng. Mục
 * "Ai cũng có" nói thẳng thứ KHÔNG nằm sau tường tiền — ảnh gốc, kỷ niệm, vòng
 * tay. Người ta trả tiền cho app tử tế, không trả cho app bóp họ.
 */
import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, Icon, IconBadge, Screen, Scroll, Tap, TopBar, Txt, type IconName } from '@ui';
import {
  duration,
  font,
  layout,
  lift,
  radius,
  space,
  useColors,
  useStyles,
  type Palette,
} from '@design';
import { useT } from '@i18n';
import type { ProPlan } from '../../api/proApi';

const PERKS = [
  { icon: 'sparkle', key: 'beads' },
  { icon: 'palette', key: 'icon' },
  { icon: 'video', key: 'video' },
  { icon: 'film', key: 'recap' },
  { icon: 'pinTop', key: 'pin' },
  { icon: 'gift', key: 'gift' },
] as const satisfies readonly { icon: IconName; key: string }[];

const FREE = ['photo', 'memories', 'bracelet', 'friends'] as const;

export function ProScreen({
  plans,
  trialDays,
  onStart,
  onBack,
  formatPrice,
}: {
  plans: readonly ProPlan[];
  trialDays: number;
  /** Trả `false` khi chưa mua được (chưa có cửa thanh toán). */
  onStart: (plan: ProPlan['id']) => Promise<boolean>;
  onBack: () => void;
  formatPrice: (vnd: number) => string;
}) {
  const t = useT();
  const s = useStyles(make);
  const c = useColors();
  const [plan, setPlan] = useState<ProPlan['id']>('year');
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    const ok = await onStart(plan);
    setBusy(false);
    setNote(ok ? null : t('pro.soon'));
  };

  return (
    <Screen>
      <TopBar title="" closeLabel={t('settings.back')} onClose={onBack} />
      <Scroll>
        <View style={s.body}>
          <Animated.View entering={FadeInDown.duration(duration.base)} style={s.hero}>
            <Icon name="crown" size={64} color={c.vivid.yellow} weight="fill" />
            <Txt variant="display" center>
              {t('pro.title')}
            </Txt>
            <Txt variant="hand" tone="accent" center>
              {t('pro.tagline')}
            </Txt>
          </Animated.View>

          <View style={s.plans}>
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={plan === p.id}
                onPick={setPlan}
                title={t(`pro.plan.${p.id}`)}
                price={formatPrice(p.price)}
                sub={
                  p.id === 'year'
                    ? t('pro.perMonth', { price: formatPrice(p.perMonth) })
                    : t('pro.cancelAnytime')
                }
                badge={p.id === 'year' ? t('pro.save') : null}
              />
            ))}
          </View>

          <View style={s.card}>
            {PERKS.map((p, i) => (
              <Animated.View
                key={p.key}
                entering={FadeInDown.delay(duration.fast + i * 50).duration(duration.base)}
                style={s.perk}
              >
                <IconBadge name={p.icon} />
                <View style={s.flex}>
                  <Txt variant="label">{t(`pro.perk.${p.key}.title`)}</Txt>
                  <Txt variant="faint" tone="muted">
                    {t(`pro.perk.${p.key}.sub`)}
                  </Txt>
                </View>
              </Animated.View>
            ))}
          </View>

          <View style={s.free}>
            <Txt variant="label">{t('pro.freeTitle')}</Txt>
            {FREE.map((k) => (
              <View key={k} style={s.freeRow}>
                <Icon name="check" size={16} color={c.mint} />
                <Txt variant="faint" tone="muted" style={s.flex}>
                  {t(`pro.free.${k}`)}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      </Scroll>

      <View style={s.footer}>
        {note ? (
          <Txt variant="faint" tone="accent" center>
            {note}
          </Txt>
        ) : null}
        <Button
          label={t('pro.start', { days: trialDays })}
          onPress={() => void start()}
          loading={busy}
          block
        />
      </View>
    </Screen>
  );
}

const PlanCard = memo(function PlanCard({
  plan,
  selected,
  onPick,
  title,
  price,
  sub,
  badge,
}: {
  plan: ProPlan;
  selected: boolean;
  onPick: (id: ProPlan['id']) => void;
  title: string;
  price: string;
  sub: string;
  badge: string | null;
}) {
  const s = useStyles(make);
  return (
    <Tap
      onPress={() => onPick(plan.id)}
      feedback="select"
      scaleTo={0.97}
      style={[s.plan, selected && s.planOn]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title} ${price}`}
    >
      {badge ? (
        <View style={s.badge}>
          <Txt variant="faint" tone="onAccent" style={s.badgeText}>
            {badge}
          </Txt>
        </View>
      ) : null}
      <Txt variant="faint" tone="muted">
        {title}
      </Txt>
      <Txt variant="section" tone={selected ? 'accent' : 'default'}>
        {price}
      </Txt>
      <Txt variant="faint" tone="muted" numberOfLines={1}>
        {sub}
      </Txt>
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    body: {
      gap: space.xl,
      paddingBottom: space.xxl,
      maxWidth: layout.maxTextWidth,
      width: '100%',
      alignSelf: 'center',
    },
    hero: { alignItems: 'center', gap: space.xs, paddingTop: space.sm },
    plans: { flexDirection: 'row', gap: space.md },
    plan: {
      flex: 1,
      gap: 2,
      padding: space.lg,
      paddingTop: space.xl,
      borderRadius: radius.xl,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.glass,
    },
    planOn: { borderColor: c.accent, backgroundColor: c.accentSoft },
    badge: {
      position: 'absolute',
      top: -12,
      right: space.md,
      paddingHorizontal: space.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: c.accent,
    },
    badgeText: { fontFamily: font.bodyBold },
    card: {
      gap: space.lg,
      padding: space.lg,
      borderRadius: radius.xl,
      backgroundColor: c.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.glassBorder,
      ...lift(c),
    },
    perk: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    flex: { flex: 1 },
    free: { gap: space.sm, paddingHorizontal: space.xs },
    freeRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    footer: { gap: space.sm, paddingTop: space.sm, paddingBottom: space.sm },
  });
