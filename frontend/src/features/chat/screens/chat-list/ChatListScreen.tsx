/**
 * Tin nhắn — danh sách kiểu Telegram (09/10/2026): ô tìm trên cùng; mỗi dòng
 * avatar (chấm xanh khi online) · tên đậm · giờ bên phải · dòng cuối ("Bạn: …",
 * "Sticker", hoặc "đang gõ…" màu nhấn) · số tin chưa đọc trong viên màu nhấn,
 * hoặc ✓/✓✓ nếu tin cuối là của mình. Cuộc vừa có tin tự lên đầu.
 */
import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, EmptyState, Field, Icon, List, Screen, TabBarSpacer, Tap, Txt } from '@ui';
import { font, radius, space, useColors, useStyles, type Palette } from '@design';
import { useAgo, useT } from '@i18n';
import { matches } from '@/lib/text/fold';
import { lastMessage, type Conversation, type Message } from '../../types';

export function ChatListScreen({
  conversations,
  onOpen,
}: {
  conversations: readonly Conversation[];
  onOpen: (id: string) => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const c = useColors();
  const ago = useAgo();
  const [query, setQuery] = useState('');

  const shown = useMemo(
    () => (query.trim() ? conversations.filter((x) => matches(query, x.friend.name)) : conversations),
    [conversations, query],
  );

  const preview = useCallback(
    (x: Conversation, last: Message | undefined): string => {
      if (x.typingUntil && x.typingUntil > Date.now()) return t('chat.typing');
      if (!last) return t('chat.noMessages');
      const body = last.kind === 'sticker' ? t('chat.sticker') : last.kind === 'image' ? t('chat.photo') : last.text;
      return last.mine ? t('chat.mineSaid', { text: body }) : body;
    },
    [t],
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const last = lastMessage(item);
      return (
        <ChatRow
          conversation={item}
          last={last}
          when={last ? ago(new Date(last.at)) : ''}
          line={preview(item, last)}
          typing={!!item.typingUntil && item.typingUntil > Date.now()}
          onOpen={onOpen}
        />
      );
    },
    [ago, onOpen, preview],
  );

  return (
    <Screen padded={false} edges={TOP}>
      <View style={s.bar}>
        <Txt variant="title" style={s.title}>
          {t('chat.title')}
        </Txt>
      </View>
      <View style={s.search}>
        <Field
          value={query}
          onChangeText={setQuery}
          placeholder={t('chat.search')}
          accessibilityLabel={t('chat.search')}
          autoCorrect={false}
          prefix={
            <View style={s.searchIcon}>
              <Icon name="search" size={18} color={c.textFaint} />
            </View>
          }
        />
      </View>

      {conversations.length === 0 ? (
        <EmptyState title={t('chat.emptyTitle')} message={t('chat.emptyMessage')} />
      ) : (
        <List
          data={shown}
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
  last,
  when,
  line,
  typing,
  onOpen,
}: {
  conversation: Conversation;
  last: Message | undefined;
  when: string;
  line: string;
  typing: boolean;
  onOpen: (id: string) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const { friend, unread } = conversation;
  return (
    <Tap onPress={() => onOpen(conversation.id)} scaleTo={0.98} style={s.row} accessibilityLabel={friend.name}>
      <View>
        <Avatar
          name={friend.name}
          uri={typeof friend.avatar === 'string' ? friend.avatar : undefined}
          level={friend.level}
          dormant={friend.dormant}
          size={58}
          recyclingKey={friend.id}
        />
        {conversation.online ? <View style={s.online} /> : null}
      </View>
      <View style={s.text}>
        <View style={s.head}>
          <Txt variant="label" numberOfLines={1} style={s.name}>
            {friend.name}
          </Txt>
          {last?.mine ? (
            <Icon
              name={last.status === 'read' ? 'checks' : 'check'}
              size={14}
              color={last.status === 'read' ? c.accent : c.textFaint}
              weight="line"
            />
          ) : null}
          <Txt variant="faint" tone={unread > 0 ? 'accent' : 'faint'}>
            {when}
          </Txt>
        </View>
        <View style={s.head}>
          <Txt
            variant="body"
            tone={typing ? 'accent' : unread > 0 ? 'default' : 'muted'}
            numberOfLines={1}
            style={s.line}
          >
            {line}
          </Txt>
          {unread > 0 ? (
            <View style={s.badge}>
              <Txt variant="faint" tone="onAccent" style={s.badgeText}>
                {unread > 99 ? '99+' : String(unread)}
              </Txt>
            </View>
          ) : null}
        </View>
      </View>
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    bar: { height: 52, justifyContent: 'center', paddingHorizontal: space.lg },
    title: { fontSize: 26, lineHeight: 34 },
    search: { paddingHorizontal: space.lg, paddingBottom: space.sm },
    searchIcon: { marginRight: space.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingHorizontal: space.lg,
      paddingVertical: space.sm,
    },
    online: {
      position: 'absolute',
      right: 1,
      bottom: 1,
      width: 14,
      height: 14,
      borderRadius: radius.full,
      backgroundColor: c.mint,
      borderWidth: 2.5,
      borderColor: c.bg,
    },
    text: {
      flex: 1,
      minWidth: 0,
      gap: 2,
      paddingVertical: space.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.borderSoft,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
    name: { flex: 1, fontSize: 17, fontFamily: font.bodyBold },
    line: { flex: 1 },
    badge: {
      minWidth: 22,
      height: 22,
      paddingHorizontal: 6,
      borderRadius: radius.full,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: { fontFamily: font.bodyBold, fontSize: 12 },
  });

/** Màn gốc của một tab: thanh tab đã lo phần đáy máy. */
const TOP = ['top'] as const;
