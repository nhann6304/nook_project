/**
 * Danh sách trò chuyện — tab thứ ba.
 *
 * Mỗi hàng là MỘT NGƯỜI, không phải một chủ đề: Nook không có nhóm, và một
 * người đúng một cuộc trò chuyện. Xem chú thích ở `../types.ts` để biết vì sao
 * đó là luật sản phẩm chứ không phải giới hạn kỹ thuật.
 *
 * Hàng hiện tin CUỐI chứ không hiện số tin chưa đọc. Con số chưa đọc là thứ
 * kéo người ta mở app vì áy náy; Nook không làm loại đó.
 */
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Col, EmptyState, GhostFrame, List, Row, Screen, TopBar, Txt } from '@ui';
import { space, useStyles, type Palette } from '@design';
import { useAgo, useT } from '@i18n';
import { lastMessage, type Conversation } from '../types';

export function ChatListScreen({
  conversations,
  onOpen,
  onOpenFeed,
}: {
  conversations: readonly Conversation[];
  onOpen: (id: string) => void;
  onOpenFeed: () => void;
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

  if (conversations.length === 0) {
    return (
      <Screen edges={['top']}>
        <TopBar title={t('chat.title')} />
        <EmptyState
          art={<GhostFrame size={140} ratio={0.72} />}
          title={t('chat.emptyTitle')}
          message={t('chat.emptyMessage')}
          actionLabel={t('chat.openFeed')}
          onAction={onOpenFeed}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top']}>
      <View style={s.bar}>
        <TopBar title={t('chat.title')} />
      </View>
      <List data={conversations} renderItem={renderItem} keyExtractor={keyOf} />
    </Screen>
  );
}

const keyOf = (c: Conversation) => c.id;

function ChatRow({
  conversation,
  when,
  line,
  onOpen,
}: {
  conversation: Conversation;
  when: string;
  /** Tin cuối, đã ghép sẵn tiền tố "Bạn:" nếu là tin của mình. */
  line: string;
  onOpen: (id: string) => void;
}) {
  const s = useStyles(make);
  return (
    <Row gap="md" align="center" style={s.row}>
      <Avatar
        name={conversation.friend.name}
        level={conversation.friend.level}
        dormant={conversation.friend.dormant}
        size={48}
        onPress={() => onOpen(conversation.id)}
        label={conversation.friend.name}
        recyclingKey={conversation.id}
      />

      <Col gap="xs" grow>
        <Row justify="between" align="center" gap="sm">
          <Txt variant="label" numberOfLines={1}>
            {conversation.friend.name}
          </Txt>
          <Txt variant="faint" tone="faint">
            {when}
          </Txt>
        </Row>
        <Txt variant="body" tone="muted" numberOfLines={1}>
          {line}
        </Txt>
      </Col>
    </Row>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    bar: { paddingHorizontal: space.lg },
    row: {
      paddingHorizontal: space.lg,
      paddingVertical: space.md,
      backgroundColor: c.bg,
    },
  });
