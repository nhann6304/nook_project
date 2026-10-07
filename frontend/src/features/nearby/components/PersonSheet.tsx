/**
 * Thẻ một người quanh đây — mở khi chạm avatar trên radar. Chỉ những gì người
 * lạ được thấy: tên, @tên, nấc khoảng cách. Không ảnh, không cấp thân (luật
 * khoá trang và cấp thân vẫn giữ) — muốn xem thêm thì "Xem trang".
 */
import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Tap, Txt } from '@ui';
import { radius, space, useStyles, type Palette } from '@design';

export function PersonSheet({
  person,
  distance,
  status,
  actionLabel,
  actionDone,
  busy,
  onAction,
  viewLabel,
  onView,
  closeLabel,
  onClose,
}: {
  person: { id: string; name: string; username: string; uri?: string } | null;
  /** "Cách bạn dưới 200 m". */
  distance: string;
  /** "Đang mở tìm quanh đây". */
  status: string;
  actionLabel: string;
  /** Đã mời / đã chung góc — nút mờ đi. */
  actionDone: boolean;
  busy: boolean;
  onAction: () => void;
  viewLabel: string;
  onView: () => void;
  closeLabel: string;
  onClose: () => void;
}) {
  const s = useStyles(make);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={person !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <Tap
          style={s.fill}
          onPress={onClose}
          scaleTo={1}
          feedback={null}
          accessibilityLabel={closeLabel}
        />
        {person ? (
          <View style={[s.sheet, { paddingBottom: insets.bottom + space.lg }]}>
            <View style={s.grip} />
            <Avatar
              name={person.name}
              uri={person.uri}
              size={96}
              ring={false}
              recyclingKey={person.id}
            />
            <View style={s.who}>
              <Txt variant="title" center numberOfLines={1}>
                {person.name}
              </Txt>
              <Txt variant="body" tone="muted" center>
                @{person.username}
              </Txt>
              <View style={s.meta}>
                <View style={s.live} />
                <Txt variant="faint" tone="mint">
                  {distance} · {status}
                </Txt>
              </View>
            </View>
            <View style={s.actions}>
              <Button
                label={actionLabel}
                variant="primary"
                onPress={onAction}
                disabled={actionDone}
                loading={busy}
                block
              />
              <Button label={viewLabel} variant="secondary" onPress={onView} block />
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: c.scrimSoft, justifyContent: 'flex-end' },
    fill: { flex: 1 },
    sheet: {
      backgroundColor: c.bg,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      alignItems: 'center',
      gap: space.lg,
      paddingTop: space.sm,
      paddingHorizontal: space.xl,
    },
    grip: { width: 40, height: 5, borderRadius: radius.full, backgroundColor: c.border },
    who: { alignItems: 'center', gap: 2, alignSelf: 'stretch' },
    meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingTop: space.xs },
    live: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: c.mint },
    actions: { alignSelf: 'stretch', gap: space.sm },
  });
