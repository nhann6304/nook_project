import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { FriendScreen } from '@/features/circle/screens/FriendScreen';
import { useMoments } from '@/features/feed/store/momentsStore';
import { useChats } from '@/features/chat/store/chatStore';
import { useT } from '@i18n';
import { useCircle } from '@/features/circle/store/circleStore';

export default function Friend() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const friend = useCircle((s) => s.friends.find((f) => f.id === id));
  const moments = useMoments((s) => s.moments);
  const photos = useMemo(() => moments.filter((m) => m.author.id === id), [id, moments]);
  const openChat = useChats((s) => s.open);

  const message = useCallback(() => {
    if (!friend) return;
    const chat = openChat(friend);
    router.push({ pathname: '/(app)/chat/[id]', params: { id: chat } });
  }, [friend, openChat, router]);

  if (!friend) return <Redirect href="/(app)/(tabs)/circle" />;

  return (
    <FriendScreen
      friend={friend}
      photos={photos}
      onMessage={message}
      onAlbum={() => Alert.alert(t('friends.albumSoon'))}
      onClose={() => router.back()}
    />
  );
}
