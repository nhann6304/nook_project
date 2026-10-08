/**
 * Tin nhắn — mỗi người một cuộc. Ảnh nhỏ bên phải là khoảnh khắc cuộc đó đang
 * nói tới: nhìn là nhớ ra "à, vụ cái biển".
 *
 * Tin cuối chưa đọc (của bạn kia gửi) thì chữ sáng và đậm; không có con số đếm.
 */
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, EmptyState, Img, List, Screen, TabBarSpacer, Tap, Txt } from '@ui';
import { radius, space, useStyles, type Palette } from '@design';
import { useAgo, useT } from '@i18n';
import { lastAbout, lastMessage, type Conversation } from '../types';

export function ChatListScreen({
  conversations,
  onOpen,
}: {
  conversations: readonly Conversation[];
  onOpen: (id: string) => void;
}) {
  const t = useT();
  const s = useStyles(make);
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
    <Screen padded={false} edges={TOP}>
      <View style={s.bar}>
        <Txt variant="title" style={s.title}>
          {t('chat.title')}
        </Txt>
      </View>

      {conversations.length === 0 ? (
        <EmptyState title={t('chat.emptyTitle')} message={t('chat.emptyMessage')} />
      ) : (
        <List
          data={conversations}
          renderItem={renderItem}
          keyExtractor={keyOf}
          ListFooterComponent={<TabBarSpacer />}
        />
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
        size={64}
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
    back: {
      width: 52,
      height: 52,
      borderRadius: radius.full,
      backgroundColor: c.accentSoft,
    },
    title: { fontSize: 22, lineHeight: 30 },
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
    thumb: { width: 52, height: 58, borderRadius: radius.sm },
  });

/** Màn gốc của một tab: thanh tab đã lo phần đáy máy. */
const TOP = ['top'] as const;
