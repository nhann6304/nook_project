/**
 * Thông báo — mới nhất trước, chia "Mới" / "Trước đó". Mỗi dòng là một thẻ
 * RIÊNG, cách nhau (bản nền xanh liền dải bị chê "dính nhau, nhạt"): avatar có
 * huy hiệu màu theo loại (tim đỏ, @ lam, người xanh lá, tin tím), tên đậm + việc
 * họ làm, giờ, ảnh nhỏ. Chưa đọc: chấm màu nhấn + giờ màu nhấn, không tô nền.
 * Không số like, không đếm ai xem — chỉ việc hai người làm với nhau.
 */
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, EmptyState, Icon, Img, List, Screen, Tap, TopBar, Txt, type IconName } from '@ui';
import { radius, space, useColors, useStyles, type Palette, type Vivid } from '@design';
import { useAgo, useT } from '@i18n';
import type { Notice } from '../types';

type Row = { type: 'head'; id: string; title: string } | { type: 'item'; id: string; n: Notice };

export function NotificationScreen({
  notices,
  onOpen,
  onClose,
}: {
  notices: readonly Notice[];
  onOpen: (n: Notice) => void;
  onClose: () => void;
}) {
  const t = useT();
  const rows = useMemo<Row[]>(() => {
    const fresh = notices.filter((n) => !n.read);
    const old = notices.filter((n) => n.read);
    return [
      ...(fresh.length ? [{ type: 'head' as const, id: 'h-new', title: t('notify.fresh') }] : []),
      ...fresh.map((n) => ({ type: 'item' as const, id: n.id, n })),
      ...(old.length ? [{ type: 'head' as const, id: 'h-old', title: t('notify.earlier') }] : []),
      ...old.map((n) => ({ type: 'item' as const, id: n.id, n })),
    ];
  }, [notices, t]);

  const render = useCallback(
    ({ item }: { item: Row }) =>
      item.type === 'head' ? <Head title={item.title} /> : <NoticeRow n={item.n} onOpen={onOpen} />,
    [onOpen],
  );

  return (
    <Screen padded={false}>
      <View style={PAD}>
        <TopBar title={t('notify.title')} closeLabel={t('common.closeScreen')} onClose={onClose} />
      </View>
      {notices.length === 0 ? (
        <EmptyState title={t('notify.emptyTitle')} message={t('notify.emptyMessage')} />
      ) : (
        <List data={rows} renderItem={render} keyExtractor={keyOf} getItemType={typeOf} />
      )}
    </Screen>
  );
}

const keyOf = (r: Row) => r.id;
const typeOf = (r: Row) => r.type;
const PAD = { paddingHorizontal: space.lg } as const;

function Head({ title }: { title: string }) {
  const s = useStyles(make);
  return (
    <Txt variant="label" tone="muted" style={s.head}>
      {title}
    </Txt>
  );
}

const NoticeRow = memo(function NoticeRow({
  n,
  onOpen,
}: {
  n: Notice;
  onOpen: (n: Notice) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const ago = useAgo();
  const badge = BADGE[n.kind];
  const tint = c.vivid[badge.hue];
  const action =
    n.kind === 'reacted'
      ? t('notify.reacted', { emoji: n.preview ?? '❤️' })
      : n.kind === 'replied'
        ? t('notify.replied', { text: n.preview ?? '' })
        : t(`notify.${n.kind}`);

  return (
    <Tap onPress={() => onOpen(n)} scaleTo={0.98} style={s.row}>
      <View>
        <Avatar
          name={n.actorName}
          uri={n.actorUri}
          size={56}
          ring={false}
          recyclingKey={n.actorId}
        />
        <View style={[s.kind, { backgroundColor: tint }]}>
          <Icon name={badge.icon} size={12} color={c.onVivid} weight="fill" />
        </View>
      </View>
      <View style={s.text}>
        <Txt variant="body" numberOfLines={3}>
          <Txt variant="label">{n.actorName}</Txt> {action}
        </Txt>
        <Txt variant="faint" tone={n.read ? 'muted' : 'accent'}>
          {ago(new Date(n.at))}
        </Txt>
      </View>
      {n.photo !== undefined ? (
        <Img source={n.photo} recyclingKey={`${n.id}-photo`} style={s.thumb} />
      ) : null}
      {n.read ? null : <View style={s.dot} />}
    </Tap>
  );
});

const BADGE: Readonly<Record<Notice['kind'], { icon: IconName; hue: Vivid }>> = {
  reacted: { icon: 'heart', hue: 'pink' },
  tagged: { icon: 'at', hue: 'blue' },
  invite: { icon: 'people', hue: 'green' },
  accepted: { icon: 'check', hue: 'teal' },
  replied: { icon: 'chat', hue: 'purple' },
};

const make = (c: Palette) =>
  StyleSheet.create({
    head: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      marginHorizontal: space.lg,
      marginBottom: space.sm,
      padding: space.md,
      borderRadius: radius.lg,
      backgroundColor: c.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderSoft,
    },
    kind: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 24,
      height: 24,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: c.surface,
    },
    text: { flex: 1, gap: 2 },
    thumb: { width: 50, height: 56, borderRadius: radius.sm },
    dot: { width: 9, height: 9, borderRadius: radius.full, backgroundColor: c.accent },
  });
