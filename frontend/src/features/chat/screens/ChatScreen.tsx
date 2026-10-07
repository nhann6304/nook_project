/**
 * Một cuộc trò chuyện — theo bảng thiết kế B10.
 *
 * Tấm ảnh mà một tin đang trả lời hiện NGAY TRONG luồng, ngay trên tin đó, đúng
 * như Locket/Instagram: cuộn lên là thấy mỗi câu nói về tấm nào. Ảnh đang chờ
 * trả lời (vừa bấm "Nhắn cho Linh…" từ màn chính) hiện trên ô soạn, gửi là nó
 * đi kèm tin.
 *
 * Tin chỉ có emoji thì vẽ TO, không bong bóng — thả tim là một cử chỉ, không
 * phải một câu.
 */
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { FlashListRef } from '@shopify/flash-list';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { Avatar, ComposerField, Icon, IconButton, Img, List, Screen, Tap, Txt } from '@ui';
import { duration, radius, space, useColors, useStyles, type Palette } from '@design';
import { useT } from '@i18n';
import { Bubble } from '../components/Bubble';
import type { About, Conversation } from '../types';

type Item =
  | { kind: 'time'; key: string; label: string }
  | { kind: 'photo'; key: string; about: About; label: string }
  | { kind: 'text'; key: string; text: string; mine: boolean };

/** Hai tin cách nhau quá chừng này thì chen một dòng giờ vào giữa. */
const GAP = 15 * 60_000;

export function ChatScreen({
  conversation,
  onSend,
  onClearReply,
  onOpenCamera,
  onOpenFriend,
  onClose,
}: {
  conversation: Conversation;
  onSend: (text: string) => void;
  onClearReply: () => void;
  onOpenCamera: () => void;
  onOpenFriend: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const c = useColors();
  const list = useRef<FlashListRef<Item>>(null);
  const { friend, replyTo } = conversation;

  const items = useMemo(() => {
    const out: Item[] = [];
    let prev = 0;
    for (const m of conversation.messages) {
      if (m.at - prev > GAP) out.push({ kind: 'time', key: `t-${m.id}`, label: clock(m.at) });
      prev = m.at;
      if (m.about) {
        const who = t('chat.sentPhoto', { name: friend.name });
        out.push({
          kind: 'photo',
          key: `p-${m.id}`,
          about: m.about,
          label: m.about.caption ? `${who} · ${m.about.caption}` : who,
        });
      }
      out.push({ kind: 'text', key: m.id, text: m.text, mine: m.mine });
    }
    return out;
  }, [conversation.messages, friend.name, t]);

  // Mở màn là ở tin mới nhất, và mỗi tin mới lại kéo xuống.
  useEffect(() => {
    if (items.length > 0) list.current?.scrollToEnd({ animated: true });
  }, [items.length]);

  const renderItem = useCallback(({ item }: { item: Item }) => <Row item={item} />, []);

  return (
    <Screen padded={false} keyboard>
      <View style={s.head}>
        <IconButton label={t('common.closeScreen')} onPress={onClose} style={s.round}>
          <Icon name="back" size={22} color={c.text} />
        </IconButton>
        <Tap onPress={onOpenFriend} scaleTo={0.97} style={s.who} accessibilityLabel={friend.name}>
          <Avatar
            name={friend.name}
            level={friend.level}
            dormant={friend.dormant}
            size={36}
            recyclingKey={friend.id}
          />
          <Txt variant="section" numberOfLines={1}>
            {friend.name}
          </Txt>
        </Tap>
      </View>

      {items.length === 0 ? (
        <View style={s.blank}>
          <Txt variant="body" tone="faint" center>
            {t('chat.noMessages')}
          </Txt>
        </View>
      ) : (
        <List
          ref={list}
          data={items}
          renderItem={renderItem}
          keyExtractor={keyOf}
          getItemType={typeOf}
          contentContainerStyle={s.list}
        />
      )}

      {replyTo ? (
        <Animated.View
          entering={FadeInDown.duration(duration.base)}
          exiting={FadeOut.duration(duration.fast)}
          style={s.reply}
        >
          <Img source={replyTo.photo} style={s.replyThumb} transition={0} />
          <View style={s.replyText}>
            <Txt variant="label" numberOfLines={1}>
              {t('chat.replyingTo', { name: friend.name })}
            </Txt>
            {replyTo.caption ? (
              <Txt variant="faint" tone="muted" numberOfLines={1}>
                {replyTo.caption}
              </Txt>
            ) : null}
          </View>
          <IconButton label={t('chat.cancelReply')} onPress={onClearReply}>
            <Icon name="close" size={18} color={c.textMuted} />
          </IconButton>
        </Animated.View>
      ) : null}

      <ComposerField
        placeholder={t('chat.placeholder', { name: friend.name })}
        sendLabel={t('chat.send')}
        onSend={onSend}
        left={
          <IconButton label={t('chat.openCamera')} onPress={onOpenCamera} style={s.camera}>
            <Icon name="camera" size={21} color={c.text} />
          </IconButton>
        }
      />
    </Screen>
  );
}

const keyOf = (i: Item) => i.key;
const typeOf = (i: Item) => i.kind;

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
function clock(at: number): string {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Không chữ, không số: chỉ emoji / ký hiệu. */
const WORDY = /[0-9A-Za-zÀ-ỹ]/;
const isEmojiOnly = (text: string) => text.length <= 8 && !WORDY.test(text);

const Row = memo(function Row({ item }: { item: Item }) {
  const s = useStyles(make);
  if (item.kind === 'time') {
    return (
      <Txt variant="faint" tone="faint" center style={s.time}>
        {item.label}
      </Txt>
    );
  }
  if (item.kind === 'photo') {
    return (
      <Animated.View entering={FadeIn.duration(duration.base)} style={s.photoRow}>
        <Img source={item.about.photo} recyclingKey={item.key} style={s.photo} shimmer />
        <Txt variant="faint" tone="faint" numberOfLines={1} style={s.photoLabel}>
          {item.label}
        </Txt>
      </Animated.View>
    );
  }
  if (isEmojiOnly(item.text)) {
    return (
      <View style={[s.emojiRow, item.mine ? s.end : s.start]}>
        <Txt style={s.emoji}>{item.text}</Txt>
      </View>
    );
  }
  return <Bubble text={item.text} mine={item.mine} />;
});

const make = (c: Palette) =>
  StyleSheet.create({
    head: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingHorizontal: space.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    round: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: c.surface },
    who: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, flexShrink: 1 },
    blank: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space.xxl,
    },
    list: { paddingTop: space.md, paddingBottom: space.sm },

    time: { paddingVertical: space.sm },
    photoRow: {
      paddingHorizontal: space.lg,
      paddingTop: space.sm,
      paddingBottom: space.xs,
      gap: space.xs + 2,
    },
    photo: { width: 150, height: 200, borderRadius: radius.md + 2 },
    photoLabel: { maxWidth: 220 },
    emojiRow: { paddingHorizontal: space.lg, paddingVertical: space.xs },
    start: { alignItems: 'flex-start' },
    end: { alignItems: 'flex-end' },
    emoji: { fontSize: 40, lineHeight: 48 },

    reply: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      marginHorizontal: space.lg,
      marginTop: space.sm,
      paddingLeft: space.sm,
      paddingVertical: space.sm,
      borderRadius: radius.md,
      backgroundColor: c.surface,
    },
    replyThumb: { width: 36, height: 48, borderRadius: radius.xs + 2 },
    replyText: { flex: 1, gap: 2 },
    camera: { width: 46, height: 46, borderRadius: radius.full, backgroundColor: c.surface },
  });
