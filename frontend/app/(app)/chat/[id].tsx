import { useCallback, useEffect } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChatScreen } from '@/features/chat/screens/chat-room/ChatScreen';
import { useChats } from '@/features/chat/store/chatStore';
import {
  loadMessages,
  markRead,
  retryMessage,
  sendMessage,
  sendTyping,
  setBackground,
} from '@/features/chat/api/chatApi';
import { useHomeNav } from '@/features/home/store/homeNav';

export default function Chat() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = useChats((s) => s.conversations.find((c) => c.id === id));
  const clearReply = useChats((s) => s.clearReply);
  const setQuote = useChats((s) => s.setQuote);
  const count = conversation?.messages.length ?? 0;

  useEffect(() => {
    if (id) void loadMessages(id);
  }, [id]);
  // Đang mở cuộc này thì mọi tin tới đều coi như đã đọc.
  useEffect(() => {
    if (id) markRead(id);
  }, [id, count]);

  const onSend = useCallback((text: string) => {
    if (id) sendMessage(id, { kind: 'text', text });
  }, [id]);

  // Vào thẳng đường dẫn này với một id không có thật thì không có gì để hiện.
  if (!conversation || !id) return <Redirect href="/(app)/(tabs)/chats" />;

  return (
    <ChatScreen
      conversation={conversation}
      onSend={onSend}
      onSticker={(sticker) => sendMessage(id, { kind: 'sticker', sticker })}
      onRetry={(m) => retryMessage(id, m.clientId)}
      onTyping={() => sendTyping(id)}
      onQuote={(q) => setQuote(id, q)}
      onClearReply={() => clearReply(id)}
      onPickBackground={(bg) => void setBackground(id, bg)}
      onOpenCamera={() => {
        router.dismissTo('/(app)/(tabs)/home');
        useHomeNav.getState().go('camera');
      }}
      onOpenFriend={() =>
        router.push({ pathname: '/(app)/friend/[id]', params: { id: conversation.friend.id } })
      }
      onClose={() => router.back()}
    />
  );
}
