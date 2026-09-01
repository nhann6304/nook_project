/**
 * Màn Góc của bạn — mười chỗ, không hơn.
 *
 * Màn trống ở đây KHÔNG dùng khung đứt nét mặc định. Nó vẽ thẳng ra mười ô:
 * một ô là bạn, chín ô còn trống. Nhìn phát là hiểu góc này chứa mười người và
 * mới có một — không cần đọc chữ, và con số 10 trở thành thứ nhìn thấy được
 * chứ không phải một luật giấu trong tài liệu.
 */
import { StyleSheet, View } from 'react-native';
import { Avatar, Col, EmptyState, Rings, Screen, Txt } from '@ui';
import { color, radius, space } from '@design';

const CIRCLE_SIZE = 10;

export type Friend = { id: string; name: string; uri?: string; level: number; dormant?: boolean };

export function CircleScreen({
  friends,
  onInvite,
}: {
  friends: readonly Friend[];
  onInvite: () => void;
}) {
  const empty = friends.length === 0;

  return (
    <Screen>
      <Col gap="xs" style={s.head}>
        <Txt variant="title">Góc của bạn</Txt>
        <Txt variant="body" tone="muted">
          {friends.length} / {CIRCLE_SIZE} chỗ
        </Txt>
      </Col>

      {empty ? (
        <EmptyState
          art={<SlotGrid filled={1} />}
          title="Góc này còn chờ chín người"
          message="Mời người đầu tiên vào đi. Chỉ mười chỗ thôi, nên chọn kỹ nhé."
          actionLabel="Mời một người bạn"
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
              <EmptySlot />
            </Col>
          ))}
        </View>
      )}
    </Screen>
  );
}

/** Lưới 5×2 — hình cho màn trống. Ô đầu là bạn, chín ô sau còn trống. */
function SlotGrid({ filled }: { filled: number }) {
  return (
    <View style={s.artGrid}>
      {Array.from({ length: CIRCLE_SIZE }, (_, i) =>
        i < filled ? (
          <View key={i} style={s.artMe}>
            <Rings size={26} />
          </View>
        ) : (
          <EmptySlot key={i} size={44} />
        ),
      )}
    </View>
  );
}

/** Một chỗ trống: vòng đứt nét, không có chữ. */
function EmptySlot({ size = 58 }: { size?: number }) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Chỗ còn trống"
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
