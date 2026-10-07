import { useCallback } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChatScreen } from '@/features/chat/screens/ChatScreen';
import { useChats } from '@/features/chat/store/chatStore';
import { useHomeNav } from '@/features/home/store/homeNav';

export default function Chat() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = useChats((s) => s.conversations.find((c) => c.id === id));
  const send = useChats((s) => s.send);
  const clearReply = useChats((s) => s.clearReply);

  const onSend = useCallback(
    (text: string) => {
      if (id) send(id, text, Date.now());
    },
    [id, send],
  );

  // Vào thẳng đường dẫn này với một id không có thật thì không có gì để hiện.
  if (!conversation) return <Redirect href="/(app)/(tabs)/chats" />;

  return (
    <ChatScreen
      conversation={conversation}
      onSend={onSend}
      onClearReply={() => clearReply(conversation.id)}
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
