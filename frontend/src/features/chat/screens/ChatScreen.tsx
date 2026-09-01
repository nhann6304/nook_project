/**
 * Màn Trò chuyện — một người, một luồng.
 *
 * Bố cục cố định từ trên xuống: thanh trên · tấm ảnh ghim · tin nhắn (cuộn) ·
 * ô soạn. Chỉ khối tin nhắn cuộn; ảnh ghim và ô soạn luôn nhìn thấy được.
 *
 * ── Vì sao ảnh ghim không cuộn theo ─────────────────────────────────────
 * Nook không có tin nhắn "chung chung" — mọi cuộc trò chuyện đều bắt đầu từ một
 * khoảnh khắc cụ thể. Cho tấm ảnh cuộn mất là mất luôn ngữ cảnh, đúng lúc cuộc
 * trò chuyện dài ra và người ta cần nó nhất.
 *
 * ── Bàn phím ────────────────────────────────────────────────────────────
 * `<Screen keyboard>` lo: iOS đẩy bằng KeyboardAvoidingView, Android đã có
 * adjustResize trong app.json. Danh sách co lại, ô soạn nằm ngay trên bàn phím.
 * Đừng làm cả hai cùng lúc — màn sẽ co hai lần.
 */
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { FlashListRef } from '@shopify/flash-list';
import { Avatar, Col, ComposerField, List, Screen, TopBar, Txt } from '@ui';
import { space, useStyles } from '@design';
import { useT } from '@i18n';
import { Bubble } from '../components/Bubble';
import { MomentPin } from '../components/MomentPin';
import type { Conversation, Message } from '../types';

export function ChatScreen({
  conversation,
  onSend,
  onClose,
}: {
  conversation: Conversation;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const list = useRef<FlashListRef<Message>>(null);
  const count = conversation.messages.length;

  // Mở màn là ở tin mới nhất, và mỗi tin mới lại kéo xuống. Không có bước này
  // thì gửi xong tin của mình nằm ngoài màn — người ta tưởng chưa gửi được.
  useEffect(() => {
    if (count > 0) list.current?.scrollToEnd({ animated: true });
  }, [count]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <Bubble text={item.text} mine={item.mine} />,
    [],
  );

  return (
    <Screen padded={false} keyboard>
      <View style={s.head}>
        <TopBar
          closeLabel={t('common.closeScreen')}
          onClose={onClose}
          right={<View style={s.slot} />}
        />
        <View style={s.who} pointerEvents="none">
          <Avatar
            name={conversation.friend.name}
            level={conversation.friend.level}
            dormant={conversation.friend.dormant}
            size={28}
            recyclingKey={conversation.friend.id}
          />
          <Txt variant="section" numberOfLines={1}>
            {conversation.friend.name}
          </Txt>
        </View>
      </View>

      {conversation.about ? (
        <MomentPin
          photo={conversation.about.photo}
          caption={conversation.about.caption}
          label={t('chat.aboutThis')}
        />
      ) : null}

      {count === 0 ? (
        <Col grow align="center" justify="center" style={s.blank}>
          <Txt variant="body" tone="faint" center>
            {t('chat.noMessages')}
          </Txt>
        </Col>
      ) : (
        <List
          ref={list}
          data={conversation.messages}
          renderItem={renderItem}
          keyExtractor={keyOf}
          contentContainerStyle={s.list}
        />
      )}

      <ComposerField
        placeholder={t('chat.placeholder', { name: conversation.friend.name })}
        sendLabel={t('chat.send')}
        onSend={onSend}
      />
    </Screen>
  );
}

const keyOf = (m: Message) => m.id;

const make = () =>
  StyleSheet.create({
    // Tên người nằm ĐÈ lên giữa thanh trên chứ không nhét vào slot tiêu đề:
    // avatar cộng chữ rộng hơn một dòng tiêu đề, nhét vào là nút đóng bị ép.
    head: { justifyContent: 'center' },
    who: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
    },
    slot: { width: 48 },
    list: { paddingTop: space.sm, paddingBottom: space.sm },
    blank: { paddingHorizontal: space.xxl },
  });
