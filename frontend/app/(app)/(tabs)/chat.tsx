import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ChatListScreen } from '@/features/chat/screens/ChatListScreen';
import { useChats } from '@/features/chat/store/chatStore';

export default function ChatList() {
  const router = useRouter();
  const conversations = useChats((s) => s.conversations);

  const open = useCallback(
    (id: string) => router.push({ pathname: '/(app)/chat/[id]', params: { id } }),
    [router],
  );

  return (
    <ChatListScreen
      conversations={conversations}
      onOpen={open}
      onOpenFeed={() => router.navigate('/(app)/(tabs)/feed')}
    />
  );
}
