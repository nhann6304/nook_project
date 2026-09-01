/**
 * Màn Góc của bạn — mười chỗ, không hơn.
 *
 * Màn trống ở đây KHÔNG dùng khung đứt nét mặc định. Nó vẽ thẳng ra mười ô:
 * một ô là bạn, chín ô còn trống. Nhìn phát là hiểu góc này chứa mười người và
 * mới có một — không cần đọc chữ, và con số 10 trở thành thứ nhìn thấy được
 * chứ không phải một luật giấu trong tài liệu.
 */
import { StyleSheet, View } from 'react-native';
import { Avatar, Col, EmptyState, Rings, Screen, TopBar, Txt } from '@ui';
import { color, radius, space } from '@design';
import { useT } from '@i18n';

const CIRCLE_SIZE = 10;

export type Friend = { id: string; name: string; uri?: string; level: number; dormant?: boolean };

export function CircleScreen({
  friends,
  onInvite,
  onClose,
}: {
  friends: readonly Friend[];
  onInvite: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const empty = friends.length === 0;

  return (
    <Screen>
      <TopBar
        title={t('circle.title')}
        closeLabel={t('common.closeScreen')}
        onClose={onClose}
      />

      <Col align="center" style={s.head}>
        <Txt variant="body" tone="muted">
          {t('circle.slots', { filled: friends.length, total: CIRCLE_SIZE })}
        </Txt>
      </Col>

      {empty ? (
        <EmptyState
          art={<SlotGrid filled={1} emptyLabel={t('circle.emptySlot')} />}
          title={t('circle.waitingTitle', { count: CIRCLE_SIZE - 1 })}
          message={t('circle.waitingMessage')}
          actionLabel={t('circle.invite')}
          onAction={onInvite}
        />
      ) : (
        <View style={s.grid}>
          {friends.map((f) => (
            <Col key={f.id} align="center" gap="sm" style={s.slot}>
              <Avatar name={f.name} uri={f.uri} level={f.level} dormant={f.dormant} size={58} />
              <Txt variant="faint" tone="muted" numberOfLines={1}>
                {f.name}
              </Txt>
            </Col>
          ))}
          {Array.from({ length: CIRCLE_SIZE - friends.length }, (_, i) => (
            <Col key={`empty-${i}`} align="center" gap="sm" style={s.slot}>
              <EmptySlot label={t('circle.emptySlot')} />
            </Col>
          ))}
        </View>
      )}
    </Screen>
  );
}

/** Lưới 5×2 — hình cho màn trống. Ô đầu là bạn, chín ô sau còn trống. */
function SlotGrid({ filled, emptyLabel }: { filled: number; emptyLabel: string }) {
  return (
    <View style={s.artGrid}>
      {Array.from({ length: CIRCLE_SIZE }, (_, i) =>
        i < filled ? (
          <View key={i} style={s.artMe}>
            <Rings size={26} />
          </View>
        ) : (
          <EmptySlot key={i} size={44} label={emptyLabel} />
        ),
      )}
    </View>
  );
}

/** Một chỗ trống: vòng đứt nét, không có chữ. */
function EmptySlot({ size = 58, label }: { size?: number; label: string }) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={[s.emptySlot, { width: size, height: size, borderRadius: size / 2 }]}
    />
  );
}

const s = StyleSheet.create({
  head: { paddingTop: space.md, paddingBottom: space.xl },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, justifyContent: 'center' },
  slot: { width: 76 },

  artGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    width: 5 * 44 + 4 * space.md,
    justifyContent: 'center',
  },
  artMe: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    borderWidth: 1.5,
    borderColor: color.borderSoft,
    backgroundColor: color.surfaceSunken,
  },
});
