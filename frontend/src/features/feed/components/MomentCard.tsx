/**
 * Một khoảnh khắc trong feed.
 *
 * Ba tầng, đúng thứ tự mắt đi: ai gửi → ảnh (có chữ NẰM TRONG) → mình đáp lại.
 *
 * ── Caption nằm TRONG ảnh, không nằm dưới ────────────────────────────────
 * Đây là chỗ Locket làm đúng: câu chữ là một phần của khoảnh khắc, không phải
 * chú thích dán bên dưới. Đặt trong ảnh được ba cái:
 *   · Thẻ không đổi chiều cao theo việc có caption hay không, nên cuộn danh
 *     sách không bị giật nhịp giữa thẻ có chữ và thẻ không chữ.
 *   · Người xem đọc chữ mà mắt không rời khỏi ảnh.
 *   · Nó khớp với chỗ người gửi vừa gõ nó vào — cùng một viên thuốc, cùng một
 *     vị trí. Cái mình gõ hiện lên đúng như lúc gõ.
 * Đổi lại: caption phải ngắn (trần 80 ký tự) và phải có nền mờ, không thì chữ
 * chìm vào ảnh sáng.
 *
 * ── Vì sao hàng đáp lại nằm NGAY trong thẻ ───────────────────────────────
 * Ở Locket muốn trả lời phải mở một màn khác. Nook để ba nút cảm xúc và một ô
 * nhắn ngay dưới ảnh, vì "ký ức" của Nook tính bằng tương tác HAI CHIỀU: nếu
 * đáp lại tốn ba nhịp thì phần lớn người ta không đáp, và cả hệ tiến trình
 * đứng im. Chỗ này là chỗ hệ thống sống hay chết.
 *
 * ── Không có gì công khai ────────────────────────────────────────────────
 * Không số lượt thích, không bình luận ai cũng đọc được. Bấm một icon cảm xúc
 * là gửi RIÊNG cho người đó. Đây là luật sản phẩm, không phải lựa chọn giao
 * diện — xem .docs/01-product-system.md.
 *
 * ── Vì sao memo ──────────────────────────────────────────────────────────
 * Thẻ nằm trong FlashList. Không memo thì cuộn một nấc là mọi thẻ đang hiện vẽ
 * lại, kể cả những thẻ không đổi gì.
 */
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Col, Img, Pill, Row, Txt } from '@ui';
import { media, radius, space, useStyles, type Palette } from '@design';
import * as feel from '@/lib/haptics';
import type { Moment } from '../types';

/** Ba cảm xúc, không hơn. Bảng đầy đủ làm người ta đứng chọn thay vì đáp. */
export const QUICK = ['🔥', '😂', '🥺'] as const;
export type Quick = (typeof QUICK)[number];

export type MomentCardProps = {
  moment: Moment;
  /** "3 phút trước" — đã dịch sẵn, thẻ không tự tính giờ. */
  ago: string;
  /** "Nhắn riêng cho Yến…" */
  replyHint: string;
  /** "Đã nhắn cho Yến" */
  repliedLabel: string;
  /** `emoji` rỗng nghĩa là mở ô nhắn chữ. */
  onReply: (moment: Moment, emoji: Quick | null) => void;
};

export const MomentCard = memo(function MomentCard({
  moment,
  ago,
  replyHint,
  repliedLabel,
  onReply,
}: MomentCardProps) {
  const s = useStyles(make);
  const reply = useCallback(
    (emoji: Quick | null) => {
      feel.confirm();
      onReply(moment, emoji);
    },
    [moment, onReply],
  );

  return (
    <Card style={s.card}>
      <Row gap="md" align="center">
        <Avatar
          name={moment.author.name}
          uri={typeof moment.author.avatar === 'string' ? moment.author.avatar : undefined}
          level={moment.author.level}
          dormant={moment.author.dormant}
          size={40}
          recyclingKey={moment.author.id}
        />
        <Col gap="xs">
          <Txt variant="label">{moment.author.name}</Txt>
          <Txt variant="faint" tone="faint">
            {ago}
          </Txt>
        </Col>
      </Row>

      <View style={s.photoBox}>
        <Img
          source={moment.photo}
          // Bắt buộc trong danh sách tái dùng ô: thiếu thì cuộn nhanh sẽ thấy
          // ảnh người này nhấp nháy ở ô người kia.
          recyclingKey={moment.id}
          style={media.cover}
        />

        {moment.caption ? (
          <View style={s.captionSlot} pointerEvents="none">
            <View style={s.caption}>
              <Txt variant="body" center numberOfLines={3}>
                {moment.caption}
              </Txt>
            </View>
          </View>
        ) : null}
      </View>

      {/* Ảnh của chính mình thì không có hàng đáp — không ai tự nhắn cho mình. */}
      {moment.mine ? null : moment.repliedTo ? (
        <Row gap="sm" align="center" style={s.replied}>
          <Txt variant="faint" tone="muted">
            {repliedLabel}
          </Txt>
        </Row>
      ) : (
        <Row gap="sm" align="center">
          {QUICK.map((emoji) => (
            <QuickPill key={emoji} emoji={emoji} onPress={reply} />
          ))}
          <Pill onPress={() => reply(null)} style={s.replyBox}>
            <Txt variant="label" tone="faint" numberOfLines={1}>
              {replyHint}
            </Txt>
          </Pill>
        </Row>
      )}
    </Card>
  );
});

/**
 * Tách ra thành component riêng để cái hàm truyền vào `onPress` không phải là
 * một mũi tên dựng lại mỗi lần thẻ vẽ.
 */
const QuickPill = memo(function QuickPill({
  emoji,
  onPress,
}: {
  emoji: Quick;
  onPress: (emoji: Quick) => void;
}) {
  const s = useStyles(make);
  return (
    <Pill onPress={() => onPress(emoji)} style={s.quick}>
      <Txt variant="body">{emoji}</Txt>
    </Pill>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
  card: { gap: space.md, marginHorizontal: space.lg, marginBottom: space.lg },
  photoBox: { position: 'relative' },
  captionSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: space.lg,
    alignItems: 'center',
  },
  caption: {
    maxWidth: '86%',
    backgroundColor: c.onPhoto,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  quick: { paddingHorizontal: space.md, minWidth: 44 },
  replyBox: { flex: 1, justifyContent: 'flex-start', backgroundColor: c.surfaceSunken },
  replied: { paddingHorizontal: space.xs, minHeight: 34 },
});
