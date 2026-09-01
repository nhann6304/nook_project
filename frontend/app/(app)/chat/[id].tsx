import { useCallback } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChatScreen } from '@/features/chat/screens/ChatScreen';
import { useChats } from '@/features/chat/store/chatStore';

export default function Chat() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = useChats((s) => s.conversations.find((c) => c.id === id));
  const send = useChats((s) => s.send);

  const onSend = useCallback(
    (text: string) => {
      if (id) send(id, text, Date.now());
    },
    [id, send],
  );

  // Vào thẳng đường dẫn này với một id không có thật thì không có gì để hiện.
  if (!conversation) return <Redirect href="/(app)/(tabs)/chat" />;

  return <ChatScreen conversation={conversation} onSend={onSend} onClose={() => router.back()} />;
}
