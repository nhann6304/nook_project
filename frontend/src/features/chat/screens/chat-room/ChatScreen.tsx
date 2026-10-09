/**
 * Phòng chat — kiểu Telegram (09/10/2026).
 *
 * Nền riêng từng cuộc (`Wallpaper`, đổi bằng nút bảng màu trên thanh) · thanh
 * trên KÍNH nổi trên nền · bong bóng có đuôi, giờ + ✓✓ trong bong bóng, cụm
 * tin cùng người khít nhau · ngày chen giữa thành viên nhỏ · "đang gõ…" cả ở
 * thanh trên lẫn bong bóng ba chấm · giữ lâu một tin để trả lời · nút mặt cười
 * mở bảng emoji + sticker THAY CHỖ bàn phím.
 *
 * Màn này không biết socket hay server — mọi việc đi qua props.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { FlashListRef } from '@shopify/flash-list';
import type { TChatBackground } from '@nook/shared/model/type';
import { ComposerField, Icon, IconButton, List, Screen, Txt, type ComposerHandle } from '@ui';
import { radius, space, useColors, useStyles, wallpaperOf, type Palette } from '@design';
import { useDate, useT } from '@i18n';
import { Wallpaper } from '../../components/Wallpaper';
import type { Conversation, Message, Quote } from '../../types';
import type { EmojiGroupId } from '../../utils/emojiSet';
import type { StickerId } from '../../utils/stickers.generated';
import { BackgroundSheet } from './components/BackgroundSheet';
import { ChatHeader } from './components/ChatHeader';
import { EmojiPanel } from './components/EmojiPanel';
import { MessageRow, type Row } from './components/MessageRow';
import { ReplyBar } from './components/ReplyBar';
import { TypingBubble } from './components/TypingBubble';

/** Hai tin cùng người cách nhau dưới mức này thì chung một cụm. */
const GROUP_MS = 3 * 60_000;

export function ChatScreen({
  conversation,
  onSend,
  onSticker,
  onRetry,
  onTyping,
  onQuote,
  onClearReply,
  onPickBackground,
  onOpenCamera,
  onOpenFriend,
  onClose,
}: {
  conversation: Conversation;
  onSend: (text: string) => void;
  onSticker: (id: StickerId) => void;
  onRetry: (m: Message) => void;
  onTyping: () => void;
  onQuote: (q: Quote | undefined) => void;
  onClearReply: () => void;
  onPickBackground: (bg: TChatBackground) => void;
  onOpenCamera: () => void;
  onOpenFriend: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const c = useColors();
  const date = useDate();
  const { width, height } = useWindowDimensions();
  const list = useRef<FlashListRef<Row>>(null);
  const input = useRef<ComposerHandle>(null);
  const [draft, setDraft] = useState('');
  const [panel, setPanel] = useState(false);
  const [sheet, setSheet] = useState(false);
  const { friend, replyTo, quote, background } = conversation;
  const typing = useTyping(conversation.typingUntil);
  const wall = wallpaperOf(c, background);

  const rows = useMemo(() => buildRows(conversation.messages, (at) => dayLabel(at, t, date), t, friend.name), [
    conversation.messages,
    date,
    friend.name,
    t,
  ]);

  // Mở màn ở tin mới nhất; tin mới (hoặc "đang gõ") lại kéo xuống.
  useEffect(() => {
    if (rows.length > 0) list.current?.scrollToEnd({ animated: true });
  }, [rows.length, typing]);

  const quoteName = useCallback((mine: boolean) => (mine ? t('chat.you') : friend.name), [friend.name, t]);

  const longPress = useCallback(
    (m: Message) =>
      onQuote({
        id: m.id,
        mine: m.mine,
        text: m.kind === 'sticker' ? t('chat.sticker') : m.text,
      }),
    [onQuote, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: Row }) => (
      <MessageRow
        row={item}
        onLongPress={longPress}
        onRetry={onRetry}
        quoteName={quoteName}
        darkWall={wall.dark}
      />
    ),
    [longPress, onRetry, quoteName, wall.dark],
  );

  const changeDraft = useCallback(
    (text: string) => {
      setDraft(text);
      if (text) onTyping();
    },
    [onTyping],
  );

  const togglePanel = useCallback(() => {
    if (panel) {
      setPanel(false);
      input.current?.focus();
    } else {
      Keyboard.dismiss();
      setPanel(true);
    }
  }, [panel]);

  const status = typing
    ? t('chat.typing')
    : conversation.online
      ? t('chat.online')
      : t('chat.lastSeenRecently');

  return (
    <View style={s.page}>
      <Wallpaper background={background} width={width} height={height} />
      <Screen padded={false} keyboard clear>
        <ChatHeader
          name={friend.name}
          avatar={typeof friend.avatar === 'string' ? friend.avatar : undefined}
          status={status}
          typing={typing}
          online={conversation.online === true}
          backLabel={t('common.closeScreen')}
          menuLabel={t('chat.background')}
          onBack={onClose}
          onOpenFriend={onOpenFriend}
          onMenu={() => setSheet(true)}
        />

        {rows.length === 0 ? (
          <View style={s.blank}>
            <View style={s.blankPill}>
              <Txt variant="body" tone="muted" center>
                {t('chat.noMessages')}
              </Txt>
            </View>
          </View>
        ) : (
          <List
            ref={list}
            data={rows}
            renderItem={renderItem}
            keyExtractor={keyOf}
            getItemType={typeOf}
            contentContainerStyle={s.list}
            ListFooterComponent={typing ? <TypingBubble /> : null}
          />
        )}

        {quote ? (
          <ReplyBar
            title={t('chat.replyTo', { name: quoteName(quote.mine) })}
            text={quote.text}
            cancelLabel={t('chat.cancelReply')}
            onCancel={() => onQuote(undefined)}
          />
        ) : replyTo ? (
          <ReplyBar
            title={t('chat.replyingTo', { name: friend.name })}
            text={replyTo.caption}
            photo={replyTo.photo}
            cancelLabel={t('chat.cancelReply')}
            onCancel={onClearReply}
          />
        ) : null}

        <View style={s.composer}>
          <ComposerField
            inputRef={input}
            value={draft}
            onChangeText={changeDraft}
            onFocus={() => setPanel(false)}
            placeholder={t('chat.placeholder', { name: friend.name })}
            sendLabel={t('chat.send')}
            onSend={onSend}
            left={
              <IconButton label={t('chat.openCamera')} onPress={onOpenCamera} style={s.side}>
                <Icon name="camera" size={24} color={c.textMuted} />
              </IconButton>
            }
            right={
              <IconButton
                label={panel ? t('chat.keyboard') : t('chat.emojiPanel')}
                onPress={togglePanel}
                style={s.emojiBtn}
              >
                <Icon name={panel ? 'edit' : 'laugh'} size={22} color={panel ? c.accent : c.textMuted} />
              </IconButton>
            }
          />
        </View>

        {panel ? (
          <EmojiPanel
            onEmoji={(e) => changeDraft(draft + e)}
            onSticker={onSticker}
            groupLabel={(id: EmojiGroupId) => t(`chat.emojiCat.${id}`)}
            emojiLabel={t('chat.emoji')}
            stickerLabel={t('chat.stickers')}
          />
        ) : null}
      </Screen>

      <BackgroundSheet
        visible={sheet}
        current={background}
        title={t('chat.backgroundTitle')}
        hint={t('chat.backgroundHint', { name: friend.name })}
        names={(k) => t(`chat.wallpaper.${k}`)}
        closeLabel={t('common.closeScreen')}
        onPick={(k) => {
          onPickBackground(k);
          setSheet(false);
        }}
        onClose={() => setSheet(false)}
      />
    </View>
  );
}

const keyOf = (r: Row) => r.key;
const typeOf = (r: Row) => (r.kind === 'msg' ? `msg-${r.m.kind}` : r.kind);

/** Cụm tin, chen ngày, chen ảnh khoảnh khắc — một lượt qua danh sách. */
function buildRows(
  messages: readonly Message[],
  day: (at: number) => string,
  t: ReturnType<typeof useT>,
  friendName: string,
): Row[] {
  const out: Row[] = [];
  let lastDay = '';
  messages.forEach((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const d = day(m.at);
    const newDay = d !== lastDay;
    if (newDay) {
      out.push({ kind: 'day', key: `d-${m.clientId}`, label: d });
      lastDay = d;
    }
    if (m.about) {
      const who = m.mine ? t('chat.you') : friendName;
      out.push({
        kind: 'about',
        key: `a-${m.clientId}`,
        about: m.about,
        mine: m.mine,
        label: m.about.caption ? `${t('chat.sentPhoto', { name: who })} · ${m.about.caption}` : t('chat.sentPhoto', { name: who }),
      });
    }
    const first =
      newDay || !!m.about || !prev || prev.mine !== m.mine || m.at - prev.at > GROUP_MS;
    const tail =
      !next || next.mine !== m.mine || next.at - m.at > GROUP_MS || day(next.at) !== d || !!next.about;
    out.push({ kind: 'msg', key: m.clientId, m, tail, first });
  });
  return out;
}

function dayLabel(at: number, t: ReturnType<typeof useT>, date: ReturnType<typeof useDate>): string {
  const d = new Date(at);
  const today = new Date();
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return t('chat.today');
  if (same(d, y)) return t('chat.yesterday');
  return date(d, { day: 'numeric', month: 'long' });
}

/** "Đang gõ" tự tắt khi tới mốc `until` — hẹn một nhịp, không chạy đồng hồ liên tục. */
function useTyping(until: number | undefined): boolean {
  // Nhớ mốc nào đã hết hạn: `until` mới tới là "đang gõ" bật lại.
  const [ended, setEnded] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!until) return;
    const timer = setTimeout(() => setEnded(until), Math.max(0, until - Date.now()) + 50);
    return () => clearTimeout(timer);
  }, [until]);
  return until !== undefined && ended !== until;
}

const make = (c: Palette) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    list: { paddingTop: space.sm, paddingBottom: space.sm },
    blank: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xxl },
    blankPill: {
      paddingHorizontal: space.lg,
      paddingVertical: space.md,
      borderRadius: radius.lg,
      backgroundColor: c.glass,
    },
    composer: { backgroundColor: c.bg },
    side: { width: 44, height: 44 },
    emojiBtn: { width: 36, height: 36 },
  });
