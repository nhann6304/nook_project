/**
 * Bảng chọn người xem đầy đủ — mở từ ô "Tìm" của hàng avatar. Góc đông người
 * thì lướt hàng ngang tìm một cái tên là "xanh mắt"; ở đây gõ vài chữ là lọc
 * ngay (bỏ dấu, không phân biệt hoa thường — `@/lib/fold`), chạm dòng để giấu / hiện.
 *
 * Modal của hệ thống: trượt lên bằng hoạt ảnh gốc, không chạy trên luồng JS.
 * Trạng thái giấu nằm ở NGƯỜI GỌI — đóng bảng không mất gì.
 */
import { memo, useCallback, useMemo, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Field, Icon, List, Tap, Txt } from '@ui';
import { radius, space, useColors, useStyles, type Palette } from '@design';
import { matches } from '@/lib/fold';
import type { AudiencePerson } from './AudiencePicker';

export function AudienceSheet({
  visible,
  people,
  hidden,
  onToggle,
  onClose,
  title,
  searchLabel,
  doneLabel,
  shownLabel,
  hiddenLabel,
  emptyLabel,
}: {
  visible: boolean;
  people: readonly AudiencePerson[];
  hidden: readonly string[];
  onToggle: (id: string) => void;
  onClose: () => void;
  title: string;
  searchLabel: string;
  doneLabel: string;
  /** Chữ nhỏ dưới tên: "Được xem" / "Không xem được". */
  shownLabel: string;
  hiddenLabel: string;
  /** Gõ mà không khớp ai. */
  emptyLabel: string;
}) {
  const s = useStyles(make);
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    // "hung" khớp "Hưng", "tran" khớp "Trần Khoa" — `matches` bỏ dấu, so đầu từng chữ.
    return query.trim() ? people.filter((p) => matches(query, p.name)) : people;
  }, [people, query]);

  const close = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  const render = useCallback(
    ({ item }: { item: AudiencePerson }) => (
      <PersonRow
        person={item}
        off={hidden.includes(item.id)}
        onToggle={onToggle}
        shownLabel={shownLabel}
        hiddenLabel={hiddenLabel}
      />
    ),
    [hidden, hiddenLabel, onToggle, shownLabel],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={s.backdrop}>
        <Tap
          style={s.fill}
          onPress={close}
          scaleTo={1}
          feedback={null}
          accessibilityLabel={doneLabel}
        />
        <View style={[s.sheet, { paddingBottom: insets.bottom + space.md }]}>
          <View style={s.grip} />
          <Txt variant="section" style={s.title}>
            {title}
          </Txt>
          <View style={s.search}>
            <Field
              value={query}
              onChangeText={setQuery}
              placeholder={searchLabel}
              accessibilityLabel={searchLabel}
              autoCorrect={false}
              returnKeyType="search"
              prefix={
                <View style={s.searchIcon}>
                  <Icon name="search" size={18} color={c.textFaint} />
                </View>
              }
            />
          </View>
          <View style={s.list}>
            {shown.length === 0 ? (
              <Txt variant="body" tone="muted" center style={s.empty}>
                {emptyLabel}
              </Txt>
            ) : (
              <List data={shown} renderItem={render} keyExtractor={keyOf} extraData={hidden} />
            )}
          </View>
          <View style={s.done}>
            <Button label={doneLabel} variant="primary" onPress={close} block />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const keyOf = (p: AudiencePerson) => p.id;

const PersonRow = memo(function PersonRow({
  person,
  off,
  onToggle,
  shownLabel,
  hiddenLabel,
}: {
  person: AudiencePerson;
  off: boolean;
  onToggle: (id: string) => void;
  shownLabel: string;
  hiddenLabel: string;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <Tap
      onPress={() => onToggle(person.id)}
      feedback="select"
      scaleTo={0.99}
      style={s.row}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !off }}
      accessibilityLabel={person.name}
    >
      <View style={off ? s.off : null}>
        <Avatar
          name={person.name}
          uri={person.uri}
          size={48}
          ring={!off}
          recyclingKey={person.id}
        />
      </View>
      <View style={s.who}>
        <Txt variant="label" numberOfLines={1}>
          {person.name}
        </Txt>
        <Txt variant="faint" tone={off ? 'danger' : 'muted'}>
          {off ? hiddenLabel : shownLabel}
        </Txt>
      </View>
      <View style={[s.check, off ? s.checkOff : s.checkOn]}>
        {off ? (
          <Icon name="eyeOff" size={16} color={c.danger} />
        ) : (
          <Icon name="check" size={16} color={c.onAccent} />
        )}
      </View>
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: c.scrimSoft, justifyContent: 'flex-end' },
    fill: { flex: 1 },
    sheet: {
      height: '78%',
      backgroundColor: c.bg,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingTop: space.sm,
    },
    grip: {
      alignSelf: 'center',
      width: 40,
      height: 5,
      borderRadius: radius.full,
      backgroundColor: c.border,
      marginBottom: space.md,
    },
    title: { paddingHorizontal: space.xl },
    search: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm },
    searchIcon: { marginRight: space.sm },
    list: { flex: 1 },
    empty: { paddingTop: space.xxl, paddingHorizontal: space.xl },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingHorizontal: space.xl,
      paddingVertical: space.sm,
    },
    off: { opacity: 0.4 },
    who: { flex: 1 },
    check: {
      width: 30,
      height: 30,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: { backgroundColor: c.accent },
    checkOff: { backgroundColor: c.surfaceRaised },
    done: { paddingHorizontal: space.lg, paddingTop: space.sm },
  });
