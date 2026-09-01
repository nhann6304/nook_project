/**
 * Màn Khoảnh khắc — ảnh bạn bè gửi tới.
 *
 * Màn trống vẽ ba khung ảnh xoè ra ĐÚNG dáng chồng ảnh ở màn Chào mừng. Cùng
 * một ngôn ngữ hình, chỉ khác là chưa có gì trong đó — người dùng nhận ra ngay
 * chỗ này rồi sẽ chứa cái gì.
 *
 * Danh sách dùng <List> (FlashList), không dùng FlatList — xem chú thích trong
 * src/components/layout/List.tsx để biết vì sao đây là chỗ quyết định độ mượt.
 */
import { StyleSheet, View } from 'react-native';
import { Col, EmptyState, GhostFrame, Img, List, Screen, Txt } from '@ui';
import { color, radius, space } from '@design';

export type Moment = { id: string; uri: string; author: string; caption?: string };

export function FeedScreen({
  moments,
  onOpenCamera,
}: {
  moments: readonly Moment[];
  onOpenCamera: () => void;
}) {
  if (moments.length === 0) {
    return (
      <Screen>
        <EmptyState
          art={<GhostFan />}
          title="Chưa có khoảnh khắc nào"
          message="Khi bạn bè trong góc gửi ảnh, chúng hiện ở đây. Bạn gửi trước một tấm nhé?"
          actionLabel="Chụp một tấm"
          onAction={onOpenCamera}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <List
        data={moments}
        renderItem={MomentRow}
        keyExtractor={keyOf}
      />
    </Screen>
  );
}

const keyOf = (m: Moment) => m.id;

/**
 * Ô trong danh sách là component ĐẶT TÊN, không phải hàm vô danh viết thẳng
 * trong renderItem. Hàm vô danh dựng lại mỗi lần cha vẽ → FlashList coi như ô
 * mới → mất sạch cái lợi của tái dùng ô.
 */
function MomentRow({ item }: { item: Moment }) {
  return (
    <Col gap="sm" style={s.row}>
      <Img
        source={{ uri: item.uri }}
        // Bắt buộc trong danh sách tái dùng ô: thiếu thì cuộn nhanh sẽ thấy
        // ảnh người này nhấp nháy ở ô người kia.
        recyclingKey={item.id}
        style={s.photo}
      />
      <View style={s.meta}>
        <Txt variant="label">{item.author}</Txt>
        {item.caption ? (
          <Txt variant="body" tone="muted">
            {item.caption}
          </Txt>
        ) : null}
      </View>
    </Col>
  );
}

/** Ba khung đứt nét xoè ra — cùng dáng với chồng ảnh ở màn Chào mừng. */
function GhostFan() {
  return (
    <View style={s.fan}>
      <View style={[s.fanCard, s.fanLeft]}>
        <GhostFrame size={112} />
      </View>
      <View style={[s.fanCard, s.fanRight]}>
        <GhostFrame size={112} />
      </View>
      <View style={s.fanCard}>
        <GhostFrame size={124} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  photo: { width: '100%', aspectRatio: 1, borderRadius: radius.frame },
  meta: { gap: space.xs, paddingHorizontal: space.xs },

  fan: { width: 230, height: 160, alignItems: 'center', justifyContent: 'center' },
  fanCard: {
    position: 'absolute',
    borderRadius: radius.frame,
    backgroundColor: color.surfaceSunken,
  },
  fanLeft: { transform: [{ translateX: -40 }, { translateY: 8 }, { rotate: '-9deg' }], opacity: 0.5 },
  fanRight: { transform: [{ translateX: 40 }, { translateY: 8 }, { rotate: '9deg' }], opacity: 0.5 },
});
