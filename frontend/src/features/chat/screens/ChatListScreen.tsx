/**
 * Tin nhắn — mỗi người một cuộc. Ảnh nhỏ bên phải là khoảnh khắc cuộc đó đang
 * nói tới: nhìn là nhớ ra "à, vụ cái biển".
 *
 * Tin cuối chưa đọc (của bạn kia gửi) thì chữ sáng và đậm; không có con số đếm.
 */
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, EmptyState, IconButton, Img, List, Screen, Tap, Txt } from '@ui';
import { radius, space, useColors, useStyles, type Palette } from '@design';
import { useAgo, useT } from '@i18n';
import { lastAbout, lastMessage, type Conversation } from '../types';

export function ChatListScreen({
  conversations,
  onOpen,
  onClose,
}: {
  conversations: readonly Conversation[];
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const c = useColors();
  const ago = useAgo();

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const last = lastMessage(item);
      return (
        <ChatRow
          conversation={item}
          when={last ? ago(new Date(last.at)) : ''}
          fresh={last?.mine === false}
          line={
            last?.mine === true
              ? t('chat.mineSaid', { text: last.text })
              : (last?.text ?? t('chat.noMessages'))
          }
          onOpen={onOpen}
        />
      );
    },
    [ago, onOpen, t],
  );

  return (
    <Screen padded={false} edges={['top']}>
      <View style={s.bar}>
        <IconButton label={t('home.backToCamera')} onPress={onClose} style={s.back}>
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </IconButton>
        <Txt variant="title" style={s.title}>
          {t('chat.title')}
        </Txt>
      </View>

      {conversations.length === 0 ? (
        <EmptyState title={t('chat.emptyTitle')} message={t('chat.emptyMessage')} />
      ) : (
        <List data={conversations} renderItem={renderItem} keyExtractor={keyOf} />
      )}
    </Screen>
  );
}

const keyOf = (c: Conversation) => c.id;

const ChatRow = memo(function ChatRow({
  conversation,
  when,
  line,
  fresh,
  onOpen,
}: {
  conversation: Conversation;
  when: string;
  line: string;
  fresh: boolean;
  onOpen: (id: string) => void;
}) {
  const s = useStyles(make);
  const { friend } = conversation;
  const about = lastAbout(conversation);
  return (
    <Tap
      onPress={() => onOpen(conversation.id)}
      scaleTo={0.98}
      style={s.row}
      accessibilityLabel={friend.name}
    >
      <Avatar
        name={friend.name}
        level={friend.level}
        dormant={friend.dormant}
        size={56}
        recyclingKey={friend.id}
      />
      <View style={s.text}>
        <View style={s.head}>
          <Txt variant="section" numberOfLines={1} style={s.name}>
            {friend.name}
          </Txt>
          <Txt variant="faint" tone="faint">
            {when}
          </Txt>
        </View>
        <Txt
          variant={fresh ? 'label' : 'body'}
          tone={fresh ? 'default' : 'muted'}
          numberOfLines={1}
        >
          {line}
        </Txt>
      </View>
      {about ? (
        <Img source={about.photo} recyclingKey={`${conversation.id}-about`} style={s.thumb} />
      ) : null}
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    bar: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingHorizontal: space.lg,
    },
    back: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: c.surface },
    title: { fontSize: 20, lineHeight: 26 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md + 2,
      paddingHorizontal: space.lg,
      paddingVertical: space.sm + 2,
    },
    text: { flex: 1, minWidth: 0, gap: 2 },
    head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    name: { flexShrink: 1 },
    thumb: { width: 40, height: 53, borderRadius: radius.xs + 3 },
  });
